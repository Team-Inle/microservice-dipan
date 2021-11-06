/**
 * 
 */

var express = require('express'); // express framework for server
var cors = require('cors'); // enable data from outside this domain
var env = require('dotenv').config(); // enable environment variables from process.env file
var axios = require('axios'); // enable POST requests using Axios library
var cheerio = require('cheerio'); // jQuery on server side (for DOM parsing)
var url = require('url');

var app = express(); // create express instance called app
app.use(express.json()); // set app to recognize incoming objects as JSON
app.use(express.urlencoded({extended: true})); // ##TODO - this might be default now... not entirely sure if necessary
app.use(cors()); // ##TODO
app.use('/public',express.static(__dirname + '/public')); // set public folder as the web root
console.log(__dirname + '/public');

app.set('port', process.env.PORT); // set app to run on port 4077

// get algos list
var getAlgos = async () => {
	try {
		var { data } = await axios.get(
			'https://www.geeksforgeeks.org/sorting-algorithms/'
		);
		var $ = cheerio.load(data);
		var items = [];
		
		$('#post-147671 > div > div.algo > div:nth-child(1) > ul > li > a').each((ind, element) => {
			items.push(url.parse($(element).attr('href')).pathname);
		});

		$('#post-147671 > div > div.algo > div:nth-child(2) > ul > li > a').each((ind, element) => {
			items.push(url.parse($(element).attr('href')).pathname);
		});
		
		return items;
	}
	catch (error) {
		throw error;
	}
};

// get algo description
var getAlgoDesc = async (algo, pNum) => {
	try {
		var { data } = await axios.get('https://www.geeksforgeeks.org' + algo);
		var $ = cheerio.load(data);
		var items = [];

		$('article.content > div.text > p').each((ind, element) => {
			items.push($(element).text());
		});
		
		return items;
	}
	catch (error) {
		throw error;
	}
};

// example:   localhost:4078/scrape?algorithm=Hello&paragraphNum=World
app.get('/scrape', function(req, res){
	// if paragraphNum variable is sent in URL then set pNum equal to that, otherwise default to 1
	var pNum = 1;
	if(req.query.paragraphNum) {
		pNum = paragraphNum;
	}

	getAlgos()
		.then(items => {
			// if requested algorithm does not have a corresponding page
			if(items.indexOf('/'+req.query.algorithm+'/') == -1) {
				console.log("Algorithm (" + req.query.algorithm + ") NOT FOUND!");
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.send({
					algorithm: req.query.algorithm,
					description: "ERROR: NOT FOUND",
				});
			}
			else {
				getAlgoDesc('/'+req.query.algorithm+'/', pNum)
				.then(items => {
					console.log(items[0]);
					res.send({ 
						algorithm: req.query.algorithm,
						description: items[0],
					});
				});
			}
		});
});


app.use(function(req,res){
	res.status(404);
	console.log("404 error");
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	console.log("500 error");
});

// ##TODO
app.listen(app.get('port'), function(){
	//console.log(app);
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
