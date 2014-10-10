
/**
 * This solution uses Node.js with the 'request' package for HTTP requests and the 'cheerio' package as a selector engine.
 *
 * Solution does not handle dynamically generatored DOM (links inserted after page loads). It could be improved by
 * using a JavaScript engine, e.g. PhantomJS.
 *
 * Concepts illustrated:
 *  - object-oriented JavaScript
 *  - asynchronous functions including iteration with parallel asynchronous functions
 *  - callback functions
 *  - functional programming
 *  - separation of concerns
 *  - DRY (don't repeat yourself)
 */

var request = require('request');
var cheerio = require('cheerio');
var url = require('url')

/**
 * Scraper class
 */

function Scraper() {

	//the url property is a configuration option (sets the page to be scraped)
	this.url = '';

	//the body property stores content of the page to be scraped
	this.body = '';

	//the links object stores the links and status results
	this.links = [];

	//the counter property tracks when all links have been checked
	this.counter = 0;

	//the scrape method fetches the web page to be checked for broken links
	this.scrape = function () {
		var self = this;
		request(this.url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.body = body;
				self.parse();
				self.analyze();
			} else {
				console.log(error);
			}
		});
	};

	//the parse method extracts the links from the page under test
	this.parse = function () {
		var self = this;
		$ = cheerio.load(this.body);
		var links = $('a');
		links.each( function( index, element ){
			var label =  $(this).text().trim();
			var link = $(this).attr('href');
			self.links.push({label: label, link: link});
		});
	};

	//the analyze method iterates each link in the page and spawns concurrent asynchronous requests to check for broken state
	this.analyze = function () {
		this.counter = 0; //reset
		this.links.forEach(function (link) {
			var self = this;
			request(link, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					link['broken'] = false;
				} else {
					link['broken'] = true;
				}
				if (self.completed()) {
					self.report();
				}
				self.counter += 1;
			});
		}, this);
	};

	//the completed method checks whether all asynchronous link requests have completed
	this.completed = function () {
		var result = false;
		if (this.counter >= this.links.length-1) {
			result = true;
		}
		return result;
	}

	//the parseUrl method assesses the type of each link
	this.parseUrl = function (url) {
		var parts = url.parse(url, true);
		if (parts.protocol === 'http:' || parts.protocol === 'https:') {
			return url;
		} else if (parts.protocol === null) {
			return this.url+url;
		} else if (parts.protocol === 'javascript:') {
			return url;
		}
	};

	//the report method outputs the results to the console
	this.report = function () {
		this.links.forEach( function(link) {
			console.log(link.link+', '+link.broken);
		}, this);
	}
};

var scraper = new Scraper();
scraper.url = 'http://www.mobileacademy.com';
scraper.scrape();
