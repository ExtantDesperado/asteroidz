(function() {

	let screens = {};

	engine.screenManager.currentScreen = '';

	engine.screenManager.changeScreen = function(screenName) {
		if (screens.hasOwnProperty(screenName)) {
			let active = document.getElementsByClassName('active');
			for (let screen = 0; screen < active.length; screen++) {
				active[screen].classList.remove('active');
			}
			screens[screenName].run();
			screens[screenName].element.classList.add('active');
			engine.screenManager.currentScreen = screenName;
		}
	};

	engine.screenManager.registerScreen = function(screenName, initialize, run) {
		let screen = document.getElementById(screenName);

		if (screen !== null) {
			screens[screenName] = {
				initialize: initialize,
				run: run,
				element: screen
			};
		}
	};

	engine.screenManager.initializeScreens = function() {
		for (screen in screens) {
			screens[screen].initialize();
		}
		let active = document.getElementsByClassName('active');
		engine.screenManager.currentScreen = active[0].id;
	}

})();