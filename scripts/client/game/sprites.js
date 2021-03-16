(function() {

	let asteroidSpriteSpecs = [];

	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			asteroidSpriteSpecs.push({
				topLeft: {
					x: 128 * j,
					y: 128 * i
				},
				width: 128,
				height: 128
			});
		}
	}

	let asteroidSpriteManager = engine.graphics.getSpriteSheetManager(game.assets['asteroid-sprites'], asteroidSpriteSpecs);

	let asteroidAnimationSpecs = [];

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			if (!(i == 3 && j == 7)) {
				asteroidAnimationSpecs.push({
					sprite: 8 * i + j,
					time: 0.04
				});
			}
		}
	}

	game.sprites.asteroidAnimation = asteroidSpriteManager.getAnimation(asteroidAnimationSpecs, true);



	let laserSpriteSpecs = [
		{
			topLeft: {
				x: 4,
				y: 5
			},
			width: 20,
			height: 26
		},
		{
			topLeft: {
				x: 6,
				y: 38
			},
			width: 17,
			height: 21
		},
		{
			topLeft: {
				x: 3,
				y: 67
			},
			width: 22,
			height: 26
		},
		{
			topLeft: {
				x: 36,
				y: 0
			},
			width: 21,
			height: 20
		},
		{
			topLeft: {
				x: 38,
				y: 25
			},
			width: 18,
			height: 24
		},
		{
			topLeft: {
				x: 39,
				y: 53
			},
			width: 17,
			height: 33
		},
		{
			topLeft: {
				x: 117,
				y: 220
			},
			width: 41,
			height: 70
		}
	];

	game.sprites.laserSpriteManager = engine.graphics.getSpriteSheetManager(game.assets['beams'], laserSpriteSpecs);



	let explosionSpriteSpecs = [];

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			explosionSpriteSpecs.push({
				topLeft: {
					x: 151 * j,
					y: 151 * i
				},
				width: 151,
				height: 151
			});
		}
	}

	let explosionSpriteManager = engine.graphics.getSpriteSheetManager(game.assets['explosion-sprites'], explosionSpriteSpecs);

	let explosionAnimationSpecs = [];

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 8; j++) {
			explosionAnimationSpecs.push({
				sprite: 8 * i + j,
				time: 0.04
			});
		}
	}

	let explosions = [];

	game.sprites.createExplosion = function(x, y) {
		let newExplosion = {
			position: {
				x: x,
				y: y
			},
			animation: explosionSpriteManager.getAnimation(explosionAnimationSpecs, false)
		};
		newExplosion.animation.start();
		explosions.push(newExplosion);

	};

	game.sprites.updateExplosions = function(elapsedTime) {
		for (let i = 0; i < explosions.length; i++) {
			if (!explosions[i].animation.update(elapsedTime)) {
				explosions.splice(i, 1);
				i -= 1;
			}
		}
	};

	game.sprites.renderExplosions = function() {
		for (let i = 0; i < explosions.length; i++) {
			let transformed = game.model.camera.toScreenCoords(explosions[i].position.x, explosions[i].position.y);
			explosions[i].animation.draw(transformed.x, transformed.y, 1, 1, 0);
		}
	};

})();