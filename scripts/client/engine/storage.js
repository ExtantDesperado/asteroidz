(function() {

	let prefix = '';

	engine.storage.setPrefix = function(s) {
		prefix = s;
	};

	engine.storage.save = function(key, value) {
		newValue = value;
		if (typeof(value) !== 'string') {
			newValue = JSON.stringify(value);
		}

		localStorage.setItem(prefix + '.' + key, newValue);
	};

	engine.storage.load = function(key) {
		let data = localStorage.getItem(prefix + '.' + key);
		try {
			data = JSON.parse(data);
		} catch(err) {
			// data is simply a string that doesn't represent an object, keep the unparsed string.
		}

		return data;
	};

	engine.storage.delete = function(key) {
		localStorage.removeItem(prefix + '.' + key);
	};

})();