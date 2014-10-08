
/* 
	This solution uses jQuery to load JSON, handle events, and as a selector engine.
	The functionality is wrapped into a Conversion class.
*/

function Conversion() {

	//the state property stores the user input selections (default 'All')
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
		this.refresh();
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
				self.refresh();
			}
		}, 'json');
	};

	this.refresh = function () {
		this.setOptions();
		this.setValues();
		this.draw();
	}

	this.values = {
		visits : 0,
		purchases: 0,
		conversion: 0
	};

	this.setValues = function () {

	}

	this.drawConversion = function () {
		$('[data-value=visits]').text(this.values.visits);
		$('[data-value=purchases]').text(this.values.purchases);
		$('[data-value=conversion]').text(this.values.conversion.toFixed(2)+'%');
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
		this.drawConversion();
	};

};

$(document).ready(function() {
	var conversion = new Conversion();
	conversion.load();

	$('body').on('change', 'select', function(event) {
		conversion.setState(this);
	});
});
