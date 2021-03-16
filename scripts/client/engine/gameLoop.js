(function() {

	let previousTime = null;
	let running = false;

	engine.startGameLoop = function() {
		running = true;
		previousTime = null;
		requestAnimationFrame(gameLoop);
	};

	engine.stopGameLoop = function() {
		running = false;
	};

	function processInput(elapsedTime) {
		engine.inputManager.update(elapsedTime);
	}

	function update(elapsedTime) {
		engine.game.model.update(elapsedTime);
		engine.particleManager.update(elapsedTime);
	}

	function render(elapsedTime) {
		engine.graphics.clear();
		engine.game.model.render(elapsedTime);
		engine.particleManager.render(elapsedTime);
	}

	function gameLoop(curTime) {
		if (previousTime == null) {				// Using performance.now() gives a negative elapsed time on first frame,
			previousTime = curTime;				// so I'm doing this instead.
		}
		elapsedTime = curTime - previousTime;
		previousTime = curTime;

		processInput(elapsedTime);
		update(elapsedTime);
		render(elapsedTime);

		if (running) {
			requestAnimationFrame(gameLoop);
		}
	}

})();