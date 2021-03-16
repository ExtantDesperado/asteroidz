(function() {

	engine.particleManager.toScreenCoords = game.model.camera.toScreenCoords;


	let playerExplosionParticleSpecs = [{
		particlesPerSecond: 100000,
		speed: {
			mean: 0.5,
			stdDev: 0.1
		},
		lifetime: {
			mean: 0.3,
			stdDev: 0.1
		},
		radius: {		// in pixels
			mean: 3,
			stdDev: 1
		},
		stroke: '',
		fill: 'rgba(255, 255, 0, 0.2)'
	}];

	game.particles.playerExplosionParticleSystem = engine.particleManager.getParticleSystem(playerExplosionParticleSpecs);


	let asteroidBreakParticleSpecs = [{
		particlesPerSecond: 10000,
		speed: {
			mean: 0.5,
			stdDev: 0.1
		},
		lifetime: {
			mean: 0.3,
			stdDev: 0.1
		},
		radius: {
			mean: 3,
			stdDev: 1
		},
		stroke: '',
		fill: 'rgba(100, 100, 100, 1)'
	}];

	game.particles.asteroidBreakParticleSystem = engine.particleManager.getParticleSystem(asteroidBreakParticleSpecs);


	let playerThrustSpecs = [{
		particlesPerSecond: 10000,
		speed: {
			mean: 0.5,
			stdDev: 0.1
		},
		angle: {
			mean: 90,
			stdDev: 5
		},
		lifetime: {
			mean: 0.1,
			stdDev: 0.02
		},
		radius: {
			mean: 3,
			stdDev: 1
		},
		stroke: '',
		fill: 'white'
	}];

	game.particles.playerThrustParticleSystem = engine.particleManager.getParticleSystem(playerThrustSpecs);

})();