
/**
 * This solution uses jQuery to load JSON (AJAX), handle events, and as a selector engine.
 *
 * Concepts illustrated:
 *  - Object-oriented JavaScript
 *	- separation of concerns (model, controller, view separation even though no MVC framework was used)
 *	- DRY (don't repeat yourself)
 *  - recursive functions
 *  - extending (native) objects with prototype
 *  - functional programming
 */

/**
 * Method for removing duplicate values from simple arrays (does not maintain order)
 * For bigger applications, consider underscore, lo-dash, or sugarjs helper libraries instead
 */

Array.prototype.unique = function() {
	return this.filter(function (element, index, array) {
        return index === array.indexOf(element);
    });
};

/**
 * Conversion class
 */

function Conversion() {

	/**
	 * Models
	 */

	//the data object stores data from the backend
	this.data = [];

	//the state object stores the user input selections (default 'All')
	this.state = {
		os: 'All',
		brand: 'All'
	};

	//the options object stores the selector options that are currently relevant for display
	this.options = {
		os: [],
		brand: []
	};

	//the values object stores the current display values
	this.values = {
		visits : 0,
		purchases: 0,
		conversion: 0
	};

	//the accumulator is used when re-calculating the display values
	this.accumulator = {
		visits: 0,
		purchases: 0
	};

	/**
	 * Controllers
	 */

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

	//the refresh method peforms all steps needed to update the page
	this.refresh = function () {
		this.setOptions();
		this.setValues();
		this.draw();
	}

	//the setState method is an event handler (triggered by a change event) and updates the state object
	this.setState = function (selector) {
		var selection = $(selector).find(':selected').text();
		if (selector.name === 'os') {
			this.state.os = selection;
			//if the currently selected brand does not belong to new OS selection, then change brand to 'All'
			if (!this.brandExistsInOs(selection, this.state.brand)) {
				this.state.brand = 'All';
			}
		} else if (selector.name === 'brand') {
			this.state.brand = selection;
		}
		this.refresh();
	};

	//the setOptions method updates the options object with the correct options to display
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
		this.options.os = this.options.os.sort();
		this.options.brand = this.options.brand.unique().sort();
	};

	/**
	 * Accumate - a recursive method to sum the visits and purchases
	 *
	 * The nested tree with a uniform structure made recursion a good solution:
	 *
	 *	- os
	 *		- visits
	 *		- purchases
	 *		- children (brand)
	 *			- visits
	 *			- purchases
	 *			- children (device)
	 *				- visits
	 *				- purchases
	 */

	this.accumulate = function (item) {
		if (item.children) {
			item.children.forEach(function (children) {
				this.accumulate(children);
			}, this);
		} else {
			this.accumulator.visits += item.visits;
			this.accumulator.purchases += item.purchases;
		}
	}

	//the walkBrand method walks the data tree depending on chosen options
	this.walkBrand = function (os) {
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

	//the walkOs method walks the data tree depending on chosen options
	this.walkOs = function () {
		this.data.forEach(function (os) {
			if (this.state.os === 'All') {
				this.walkBrand(os);
			} else if (this.state.os === os.os) {
				this.walkBrand(os);
			}
		}, this);
	}

	//the setOptions method updates the values object with the correct values to display, dending on chosen options
	this.setValues = function () {
		//reset the accumulator:
		this.accumulator.visits = 0;
		this.accumulator.purchases = 0;
		//walk the data object to accumulate relevant values:
		this.walkOs();
		//store the final values:
		this.values.visits = this.accumulator.visits;
		this.values.purchases = this.accumulator.purchases;
		this.values.conversion = (this.accumulator.purchases / this.accumulator.visits) * 100;
	};

	/**
	 * Views
	 */

	//the draw method updates the page
	this.draw = function() {
		this.drawSelector('os');
		this.drawSelector('brand');
		this.drawValues();
	};

	this.drawSelector = function (type) {
		var options = [], i = -1;
		this.options[type].forEach(function (option) {
			options[++i] = '<option>'+option+'</option>';
		}, this);
		$('[name='+type+']').html(options.join(''));		
		$('[name='+type+']').val(this.state[type]);
	};

	this.drawValues = function () {
		$('[data-value=visits]').text(this.values.visits);
		$('[data-value=purchases]').text(this.values.purchases);
		$('[data-value=conversion]').text(this.values.conversion.toFixed(2)+'%');
	};

	/**
	 * Helpers
	 */

	//test if a brand exists for a particular os
	this.brandExistsInOs = function (osName, brandName) {
		var found = false;
		this.data.forEach(function (os) {
			if (os.os === osName) {
				if (os.children) {
					os.children.forEach(function (brand) {
						if (brand.brand === brandName) {
							found = true;	
						}
					}, this);
				}
			}
		}, this);
		return found;
	}

};

$(document).ready(function() {
	var conversion = new Conversion();
	conversion.load();

	$('body').on('change', 'select', function(event) {
		conversion.setState(this);
	});
});
