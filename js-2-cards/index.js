
/**
 * This solution uses jQuery to load and parse XML (AJAX), handle events, as a selector engine, and as an animation engine.
 *
 * To implement the card change animation, the solution uses z-index to create a temporary 'background buffer'.
 *
 * Concepts illustrated:
 *  - object-oriented JavaScript
 *  - separation of concerns
 *  - functional programming
 */

/**
 * Cards class
 */

function Cards() {

	//the cards object stores each loaded card
	this.cards = [];

	//the state property stores which card is currently being displayed
	this.state = 0;

	//the load method uses AJAX to fetch the XML from the backend
	this.load = function () {
		$.ajax({
		    type: "GET",
		    url: "data.xml",
		    dataType: "xml",
		    context: this,
		    success: this.xmlParser
		});
	};

	//the xmlParser method parses the XML into the cards object and draws the first card
	this.xmlParser = function (xml) {
		var self = this;
		$(xml).find('card').each(function () {
			var title = $(this).attr('title');
			var html = $(this).html();
			self.cards.push({title: title, html: html});
		})
		this.draw(0, "#card");
	};

	//the animate method performs the card change with an animation
	this.animate = function (left) {
		$('#container').append('<div id="buffer"></div>').css('z-index', '-1'); //temporary buffer, background layer
		this.draw(this.state, '#buffer'); //draw the new card onto the background buffer
		$("#card").animate({ //animate the old card off the screen
			left: left
		}, 800, function () { //callback on completion
			$("#card").remove(); //remove the old card
			$("#buffer").attr("id","card").css('z-index', 'auto'); //make the temporary buffer become the new card, and bring it to front layer
			$("#container").css('z-index', 'auto');
		});
	}

	//the next method draws the next page
	this.next = function () {
		if (this.state < this.cards.length-1) {
			this.state += 1;
			var width = $(window).width();
			this.animate(-width);
		}
	};

	//the previous method draws the previous page
	this.previous = function () {
		if (this.state > 0) {
			this.state -= 1;
			var width = $(window).width();
			this.animate(width);
		}
	};

	//the draw method renders the card onto a container
	this.draw = function (card, container) {
		var html = [], i = -1;
		html[++i] = '<h1>'+this.cards[card].title+'</h1>';
		html[++i] = '<div>'+this.cards[card].html+'</div>';
		$(container).html(html.join(''));
	};
};

$(document).ready(function() {
	var cards = new Cards();
	cards.load();

	$('#navigation').on('click', '#previous', function(event) {
		cards.previous();
	});

	$('#navigation').on('click', '#next', function(event) {
		cards.next();
	});
});
