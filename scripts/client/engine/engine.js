let engine = {
	random: {},
	canvas: document.getElementById('canvas'),
	network: {},
	graphics: {},
	storage: {},
	audioManager: {},
	inputManager: {},
	particleManager: {},
	screenManager: {}
};

engine.registerGame = function(game) {
	engine.game = game;
	if (engine.game.hasOwnProperty('name')) {
		engine.storage.setPrefix(engine.game.name);
	}
};