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
    var _delay = req.body.delay;
	var _wd = req.body.width;
	var _ht = req.body.height;

    // if(req.body.cookies){
    //     var _cookies = JSON.parse(req.body.cookies);
    // }

    if(req.body.cookies){
        var _cookies = req.body.cookies;
    }

    var sitepage = null;
	var phInstance = null;

	var outObj = [];
    var reqres = [];
	var status_text = ''

	phantom.create(['--ignore-ssl-errors=yes', '--ssl-protocol=any'])
    .then(instance => {
        phInstance = instance;
        // console.log("Phantom Initiated");
        return instance.createPage();
    })   
    .then(page => {
        sitepage = page;
        if(_cookies){
            _cookies.forEach(cookie => { sitepage.addCookie(cookie); });
        }
    })
    .then(function(){        
        outObj.req = [];
        outObj.res = [];
        outObj.html = '';
        outObj.jpeg = '';

        // console.log("UserAgent has been set to " + _useragent);
        sitepage.setting('userAgent', _useragent);

        // console.log("Screenshot size has been set to " + _wd + "x" + _ht);
        sitepage.property('viewportSize', {width: _wd, height: _ht});

        // gather all request objects
        sitepage.on('onResourceRequested', function(requestData, networkRequest) {
            // console.log("Resources Being Requested.");
            outObj.req.push(requestData);
        });

        // gather all response objects
        sitepage.on('onResourceReceived', function(responseData) {
            // console.log("Resources Being Received.");
            if(responseData.stage == 'end'){
                outObj.res.push(responseData);
            }
        });

        // take screenshot at onLoadFinished
        sitepage.on('onLoadFinished', function(){

            // handle cases when the background of the page is transparent or rgba(0,0,0,0)
            sitepage.evaluate(function() {
                if ('transparent' === document.defaultView.getComputedStyle(document.body).getPropertyValue('background-color')) {
                    document.body.style.backgroundColor = '#fff';
                }
                if ('rgba(0, 0, 0, 0)' === document.defaultView.getComputedStyle(document.body).getPropertyValue('background-color')) {
                    document.body.style.backgroundColor = '#fff';
                }
            });

            // scroll to the full height of the site
            sitepage.evaluate(function(){
                window.scrollTo(0, document.body.scrollHeight);
            });          

            // render the site screenshot in base64 encoded and save it for later
            sitepage.renderBase64('JPEG')
            .then(screenshot => { 
                outObj.jpeg = screenshot;
            })
        });
    })
    .then(function(){
        // sitepage.property('cookies').then(coo => {console.log(coo);});
        return sitepage.open(_url);
    })
    .then(status => {
    	status_text = status;
        // console.log("Page Status: " + status);

        return sitepage.property('content');
    })
    .then(content => {

        sitepage.close();
        // sort all request response objects to make a pair
        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        var sorted_req = sortByKey(outObj.req, 'id');
        var sorted_res = sortByKey(outObj.res, 'id');

        for (var i = 0; i <= outObj.req.length-1; i++)
            reqres.push({req: sorted_req[i], res: sorted_res[i]});

        res.json({
            status: status_text,
            reqres: reqres,
            html: content,
            jpg: outObj.jpeg
        });                    
    
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

