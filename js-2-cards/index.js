
function Cards() {

	this.cards = [];

	this.state = 0;

	this.load = function () {
		$.ajax({
		    type: "GET",
		    url: "data.xml",
		    dataType: "xml",
		    context: this,
		    success: this.xmlParser
		});
	};

	this.xmlParser = function (xml) {
		var self = this;
		$(xml).find('card').each(function () {
			var title = $(this).attr('title');
			var html = $(this).html();
			self.cards.push({title: title, html: html});
		})
		this.draw(0, "#card");
	};

	this.animate = function (left) {
		$('#container').append('<div id="buffer"></div>').css('z-index', '-1');
		this.draw(this.state, '#buffer');
		$("#card").animate({
			left: left
		}, 800, function () {
			$("#card").remove();
			$("#buffer").attr("id","card").css('z-index', 'auto');
			$("#container").css('z-index', 'auto');
		});
	}

	this.next = function () {
		if (this.state < this.cards.length-1) {
			this.state += 1;
			var width = $(window).width();
			this.animate(-width);
		}
	};

	this.previous = function () {
		if (this.state > 0) {
			this.state -= 1;
			var width = $(window).width();
			this.animate(width);
		}
	};

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
