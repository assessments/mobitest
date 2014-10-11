
function Cards() {

	this.cards = [];

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
		this.draw();
	};

	this.draw = function () {
		var html = [], i = -1;
		html[++i] = '<h1>'+this.cards[0].title+'</h1>';
		html[++i] = '<div>'+this.cards[0].html+'</div>';
		$('#content').html(html.join(''));
	};
};

$(document).ready(function() {
	var cards = new Cards();
	cards.load();
});
