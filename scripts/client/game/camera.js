(function() {

	game.model.camera = {
		position: {				// Center of camera, world coordinates
			x: 0,
			y: 0
		},
		width: engine.canvas.width,
		height: engine.canvas.height,
	};

	// Ratio of the screen that player can move in without screen moving
	const BOX_RATIO = 1 / 3;

	game.model.camera.setPosition = function(x, y) {
		game.model.camera.position.x = x;
		game.model.camera.position.y = y;
	};

	game.model.camera.update = function() {

		let xMin = game.model.camera.position.x - BOX_RATIO / 2;
		let xMax = game.model.camera.position.x + BOX_RATIO / 2;
		let yMin = game.model.camera.position.y - BOX_RATIO / 2;
		let yMax = game.model.camera.position.y + BOX_RATIO / 2;

		if (game.model.player.position.x < xMin) {
			game.model.camera.position.x = game.model.player.position.x + BOX_RATIO / 2;
		} else if (game.model.player.position.x > xMax) {
			game.model.camera.position.x = game.model.player.position.x - BOX_RATIO / 2;
		}

		if (game.model.player.position.y < yMin) {
			game.model.camera.position.y = game.model.player.position.y + BOX_RATIO / 2;
		} else if (game.model.player.position.y > yMax) {
			game.model.camera.position.y = game.model.player.position.y - BOX_RATIO / 2;
		}

		game.model.camera.position.x = Math.max(game.model.camera.position.x, game.model.bounds.x.lower + 0.5);
		game.model.camera.position.x = Math.min(game.model.camera.position.x, game.model.bounds.x.upper - 0.5);
		game.model.camera.position.y = Math.max(game.model.camera.position.y, game.model.bounds.y.lower + 0.5);
		game.model.camera.position.y = Math.min(game.model.camera.position.y, game.model.bounds.y.upper - 0.5);
	};

	game.model.camera.toScreenCoords = function(x, y) {
		return {
			x: (x - game.model.camera.position.x + 0.5) * game.model.camera.width,
			y: (y - game.model.camera.position.y + 0.5) * game.model.camera.height
		};
	};

	game.model.camera.isInScreen = function(x, y) {
		if (x > game.model.camera.position.x - 0.5 && x < game.model.camera.position.x + 0.5) {
			if (y > game.model.camera.position.y - 0.5 && y < game.model.camera.position.y + 0.5) {
				return true;
			}
		}
		return false;
	};

})();