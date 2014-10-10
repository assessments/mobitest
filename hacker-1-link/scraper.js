
/*
	- todo: HTTPS?
	- todo: dynamically generated links (e.g. PhantomJS)
*/

var request = require('request');
var cheerio = require('cheerio');
var url = require('url')

function Scraper() {

	this.url = '';

	this.body = '';

	this.links = [];

	this.process = function () {
		this.parse()
		scraper.analyze();

	}

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

	this.counter = 0;

	this.completed = function () {
		var result = false;
		if (this.counter >= this.links.length-1) {
			result = true;
		}
		return result;
	}

	this.analyze = function () {
		this.counter = 0; //reset
		this.links.forEach( function(link) {
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

	this.parseUrl = function (url) {
		var parts = url.parse(url, true);
		if (parts.protocol === 'http:') {
			return url;
		} else if (parts.protocol === null) {
			return this.url+url;
		} else if (parts.protocol === 'javascript:') {
			return url;
		}
	};

	this.report = function () {
		this.links.forEach( function(link) {
			console.log(link.link+', '+link.broken);
		}, this);
	}

	this.scrape = function () {
		var self = this;
		request(this.url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.body = body;
				self.process();
			} else {
				console.log(error);
			}
		});
	};
};

var scraper = new Scraper();
scraper.url = 'http://www.mobileacademy.com';
scraper.scrape();
