// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');        // call express
var app        	= express();                 // define our app using express
var bodyParser 	= require('body-parser');
var phantom 	= require('phantom'); 			// get phantom context here

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9999;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:9999/)
router.post('/', function(req, res) {

	// get the post variables
	var _url = req.body.url;
	var _useragent = req.body.useragent;
	var _wd = req.body.width;
	var _ht = req.body.height;

	var sitepage = null;
	var phInstance = null;

	var outObj = [];
	var status_text = ''

	phantom.create(['--ignore-ssl-errors=yes',])
    .then(instance => {
        phInstance = instance;
        // console.log("Phantom Initiated");
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;

        outObj.req = [];
        outObj.res = [];
		outObj.html = '';
		outObj.jpeg = '';

		// gather all request objects
        page.on('onResourceRequested', function(requestData, networkRequest) {
            // console.log("Resources Being Requested.");
            outObj.req.push(requestData);
        });

		// gather all response objects
        page.on('onResourceReceived', function(responseData) {
            // console.log("Resources Being Received.");
            if(responseData.stage == 'end'){
                outObj.res.push(responseData);
            }
		});

        // check for page load callback and then take screenshot
        page.on('onLoadFinished', function(status){
            page.renderBase64('JPEG').then(screenshot => { outObj.jpeg = screenshot; });
        });


		page.setting('userAgent', _useragent);
        // console.log("UserAgent has been set to " + _useragent);
        page.property('viewportSize', {width: _wd, height: _ht});
        // console.log("Screenshot size has been set to " + _wd + "x" + _ht);

        return page.open(_url);
    })
    .then(status => {
    	status_text = status;
        // console.log("Page Status: " + status);
        return sitepage.property('content');
    })
    .then(content => {
	   	sitepage.close();
        reqres = [];

        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        sorted_req = sortByKey(outObj.req, 'id');
        sorted_res = sortByKey(outObj.res, 'id');

        for (var i = 0; i <= outObj.req.length-1; i++) {
            reqres.push({req: sorted_req[i], res: sorted_res[i]});
        };

        res.json({
        	status: status_text,
        	reqres: reqres,
        	html: content,
        	jpg: outObj.jpeg
        });
        // console.log("Done Processing.");
        phInstance.exit();
    })
    .catch(error => {
        // console.log("Error During Processing.");
        console.log(error);
        res.json({
            status: '911',
            reqrep: '',
            html: '',
            jpg: ''
        });
        phInstance.exit();
    });
  
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('API Server started on port ' + port);
