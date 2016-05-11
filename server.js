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
	var _wd = req.body.scr_width;
	var _ht = req.body.scr_height;

	var sitepage = null;
	var phInstance = null;

	var outObj = [];
	var status_text = ''

	phantom.create(['--ignore-ssl-errors=yes',])
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;

		outObj.reqs = [];
		outObj.reps = [];
		outObj.html = [];
		outObj.jpeg = '';

		page.on('onResourceRequested', function(requestData, networkRequest, out) {
			//console.log(requestData.url);
		    out.reqs.push(requestData);
		}, outObj);

		page.on('onResourceReceived', function(responseData, out) {
		    //console.log(responseData.url);
		    out.reps.push(responseData);
		}, outObj);

		page.setting('userAgent', _useragent);
        page.property('viewportSize', {width: _wd, height: _ht});

        return page.open(_url);
    })
    .then(status => {
    	status_text = status;
        console.log("Page Status: " + status);
        return sitepage.property('content');
    })
    .then(content => {
        html_buffer = new Buffer(content);
	   	sitepage.close();
        res.json({
        	status: status_text,
        	request: outObj.reqs,
        	response: outObj.reps,
        	// html: content,
        	html: html_buffer.toString('base64'),
        	jpg: sitepage.renderBase64('PNG')
        });
        phInstance.exit();
    })
    .catch(error => {
        console.log(error);
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