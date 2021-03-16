engine.inputManager.keyboard = (function() {
	const inputTypes = {
		CONTINUOUS: 'continuous',
		SINGULAR: 'singular',
		ITERATED: 'iterated'
	};

	let that = {
		keys: {},
		pressHandlers: {},
		releaseHandlers: {}
	};

	function keyPress(e) {
		that.keys[e.key] = e.timeStamp;
	}

	function keyRelease(e) {
		delete that.keys[e.key];
		if (that.pressHandlers.hasOwnProperty(e.key)) {
			if (that.pressHandlers[e.key].type === inputTypes.SINGULAR && that.pressHandlers[e.key].hasOwnProperty('hasRun')) {
				that.pressHandlers[e.key].hasRun = false;
			} else if (that.pressHandlers[e.key].type === inputTypes.ITERATED) {
				that.pressHandlers[e.key].timeRemaining = 0;
			}
		}
		if (that.releaseHandlers.hasOwnProperty(e.key)) {
			that.releaseHandlers[e.key].shouldRun = true;
		}
	}

	window.addEventListener('keydown', keyPress);
	window.addEventListener('keyup', keyRelease);

	that.registerContinuous = function(key, handler) {
		that.pressHandlers[key] = {
			type: inputTypes.CONTINUOUS,
			run: handler
		};
	};

	that.registerSingular = function(key, handler) {
		that.pressHandlers[key] = {
			type: inputTypes.SINGULAR,
			run: handler,
			hasRun: false
		};
	};

	that.registerIterated = function(key, handler, interval) {
		that.pressHandlers[key] = {
			type: inputTypes.ITERATED,
			run: handler,
			interval: interval,
			timeRemaining: 0
		};
	};

	that.registerRelease = function(key, handler) {
		that.releaseHandlers[key] = {
			run: handler,
			shouldRun: false
		};
	}

	that.unregister = function(key) {
		delete that.pressHandlers[key];
	};

	that.update = function(elapsedTime) {
		Object.keys(that.keys).forEach(key => {
			if (that.pressHandlers.hasOwnProperty(key)) {
				switch (that.pressHandlers[key].type) {
					case inputTypes.CONTINUOUS:
						that.pressHandlers[key].run(elapsedTime);
						break;
					case inputTypes.SINGULAR:
						if (that.pressHandlers[key].hasOwnProperty('hasRun') && !that.pressHandlers[key].hasRun) {
							that.pressHandlers[key].run(elapsedTime);
							that.pressHandlers[key].hasRun = true;
						}
						break;
					case inputTypes.ITERATED:
						that.pressHandlers[key].timeRemaining -= elapsedTime;
						if (that.pressHandlers[key].timeRemaining <= 0) {
							that.pressHandlers[key].run(elapsedTime);
							that.pressHandlers[key].timeRemaining += that.pressHandlers[key].interval;
						}
						break;
					default:;
				}
			}
		});

		Object.keys(that.releaseHandlers).forEach(key => {
			if (that.releaseHandlers[key].shouldRun) {
				that.releaseHandlers[key].run();
				that.releaseHandlers[key].shouldRun = false;
			}
		});
	};

	return that;
})();


engine.inputManager.mouse = (function() {
	const eventTypes = {
		MOUSE_DOWN: 'mousedown',
		MOUSE_UP: 'mouseup',
		MOUSE_MOVE: 'mousemove'
	};

	let that = {
		commands: [],
		handlers: {
			[eventTypes.MOUSE_DOWN]: [],
			[eventTypes.MOUSE_UP]: [],
			[eventTypes.MOUSE_MOVE]: []
		}
	};

	function mouseDown(e) {
		that.commands.push(e);
	}

	function mouseUp(e) {
		that.commands.push(e);
	}

	function mouseMove(e) {
		that.commands.push(e);
	}

	engine.canvas.addEventListener(eventTypes.MOUSE_DOWN, mouseDown);
	engine.canvas.addEventListener(eventTypes.MOUSE_UP, mouseUp);
	engine.canvas.addEventListener(eventTypes.MOUSE_MOVE, mouseMove);

	that.registerMouseDown = function(handler) {
		that.handlers[eventTypes.MOUSE_DOWN].push(handler);
	};

	that.registerMouseUp = function(handler) {
		that.handlers[eventTypes.MOUSE_UP].push(handler);
	};

	that.registerMouseMove = function(handler) {
		that.handlers[eventTypes.MOUSE_MOVE].push(handler);
	};

	that.update = function(elapsedTime) {
		while (that.commands.length > 0) {
			command = that.commands.shift();
			if (that.handlers.hasOwnProperty(command.type)) {
				for (let i = 0; i < that.handlers[command.type].length; i++) {
					that.handlers[command.type][i](command, elapsedTime);
				}
			}
		}
	};

	return that;
})();


engine.inputManager.update = function(elapsedTime) {
	engine.inputManager.keyboard.update(elapsedTime);
	engine.inputManager.mouse.update(elapsedTime);
};