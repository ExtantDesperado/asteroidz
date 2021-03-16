(function() {

	let imageArray = [];

	let numTilesHorizontal = 0;
	let numTilesVertical = 0;

	game.model.initializeBackground = function() {
		imageArray = [];

		numTilesHorizontal = game.model.bounds.x.upper - game.model.bounds.x.lower;
		numTilesVertical = game.model.bounds.y.upper - game.model.bounds.y.lower;

		for (let i = 0; i < numTilesVertical; i++) {
			for (let j = 0; j < numTilesHorizontal; j++) {
				let imageSource = 'tile-' + i + '-' + j;
				imageArray.push(engine.graphics.getImage(game.assets[imageSource]));
			}
		}
	}

	game.model.renderBackground = function() {
		let row = Math.floor(game.model.camera.position.y - 0.5);
		let col = Math.floor(game.model.camera.position.x - 0.5);
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				if (row + i < numTilesVertical && col + j < numTilesHorizontal) {
					let transformed = game.model.camera.toScreenCoords(col + j + 0.5, row + i + 0.5);
					let image = imageArray[(row + i) * numTilesHorizontal + col + j];
					image.draw(
						transformed.x, transformed.y,
						game.model.camera.width / image.width,
						game.model.camera.height / image.height,
						0
					);
				}
			}
		}
	};

})();