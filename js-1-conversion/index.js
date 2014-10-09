
/* 
	This solution uses jQuery to load JSON, handle events, and as a selector engine.
	The functionality is wrapped into a Conversion class.
*/


Array.prototype.unique = function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
        if (unique.indexOf(this[i]) == -1) {
            unique.push(this[i]);
        }
    }
    return unique;
};

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
		this.options.brand = this.options.brand.unique(); //remove duplicates from brand array
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

	this.cumulative = {
		visits: 0,
		purchases: 0
	};

	/*
		- os
			- visits
			- purchases
			- children (brand)
				- visits
				- purchases
				- children (device)
					- visits
					- purchases
	*/

	this.accumulate = function (item) {
		if (item.children) {
			item.children.forEach(function (children) {
				this.accumulate(children);
			}, this);
		} else {
			this.cumulative.visits += item.visits;
			this.cumulative.purchases += item.purchases;
		}
	}

	this.accumulateBrand = function (os) {
		if (this.state.brand === 'All') {
			this.accumulate(os);
		} else if (os.children) {
			os.children.forEach(function (brand) {
				if (this.state.brand === brand.brand) {
					this.accumulate(brand);
				}
			}, this);
		}
	}

	this.accumulateOs = function () {
		this.data.forEach(function (os) {
			if (this.state.os === 'All') {
				this.accumulateBrand(os);
			} else if (this.state.os === os.os) {
				this.accumulateBrand(os);
			}
		}, this);
	}

	this.setValues = function () {
		this.cumulative.visits = 0; //reset
		this.cumulative.purchases = 0; //reset

		this.accumulateOs();

		this.values.visits = this.cumulative.visits;
		this.values.purchases = this.cumulative.purchases;
		this.values.conversion = (this.cumulative.purchases / this.cumulative.visits) * 100;
	};

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
