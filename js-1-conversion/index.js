// your code goes here

/* 
	This solution uses jQuery to load JSON, handle events, and as a selector engine.
	The functionality is wrapped into a Page class.
*/

function Page() {

	//the state property stores the user input selections
	this.state = {
		os: 'All',
		brand: 'All'
	};

	//the setState method is triggered by a change event and updates the state property
	this.setState = function (selector) {
		var selection = $(selector).find(':selected').text();
		if (selector.name === 'os') {
			this.state.os = selection;
		} else if (selector.name === 'brand') {
			this.state.brand = selection;
		}
		this.setOptions();
		this.draw();
	};

	this.options = {
		os: [],
		brand: []
	};

	//setOptions updates the options property with the correct values to display
	this.setOptions = function () {
		this.options.os = ['All']; //reset
		this.options.brand = ['All']; //reset
		this.data.forEach(function (os) {
			this.options.os.push(os.os);
			if (os.children) {
				os.children.forEach(function (brand) {
					if (this.state.os === 'All' || this.state.os === os.os) {
						this.options.brand.push(brand.brand);	
					}
				}, this);
			}
		}, this);
	};

	//the data property stores data from the backend
	this.data = [];

	//the load method uses AJAX to fetch the data from the backend
	this.load = function() {
		var self = this;
		$.get( "data.json", function (data) {
			if (data != null) {
				self.data = data;
				self.setOptions();
				self.draw();
			}
		}, 'json');
	};

	this.drawSelector = function (type) {
		var options = [], i = -1;
		this.options[type].forEach(function (option) {
			options[++i] = '<option>'+option+'</option>';
		}, this);
		$('[name='+type+']').html(options.join(''));		
		$('[name='+type+']').val(this.state[type]);
	};

	this.draw = function() {
		this.drawSelector('os');
		this.drawSelector('brand');
	};

};

$(document).ready(function() {
	var page = new Page();
	page.load();

	$('body').on('change', 'select', function(event) {
		page.setState(this);
	});
});
