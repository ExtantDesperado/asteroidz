(function() {

	let systems = [];

	// Effect spec layouts
	//
	// 	{
	// 		particlesPerSecond:
	// 		speed: {
	// 			mean:
	// 			stdDev:
	// 		}
	// 		angle: {		optional
	// 			mean:
	// 			stdDev:
	// 		}
	// 		lifetime: {
	// 			mean:
	// 			stdDev:
	// 		}
	// 		radius: {
	// 			mean:
	// 			stdDev:
	// 		}
	// 		stroke:
	// 		fill:
	// 	}
	//
	//	OR
	//
	//	{
	//		particlesPerSecond:
	// 		speed: {
	// 			mean:
	// 			stdDev:
	// 		}
	// 		angle: {		optional
	// 			mean:
	// 			stdDev:
	// 		}
	// 		lifetime: {
	// 			mean:
	// 			stdDev:
	// 		}
	//		image:
	//		scale: {
	//			mean:
	//			stdDev:
	//		}
	//		rotation: {		optional
	//			mean:
	//			stdDev:
	//		}
	//		angularVelocity: {	optional
	//			mean:
	//			stdDev:
	//		}
	//	}

	// Default conversion function
	engine.particleManager.toScreenCoords = function(x, y) {
		return { x: x, y: y };
	}

	engine.particleManager.getParticleSystem = function(effects) {
		let system = {};
		system.effects = effects;

		for (let i = 0; i < system.effects.length; i++) {
			system.effects[i].particles = [];
		}

		system.createParticles = function(posFunc, angleFunc, elapsedTime) {
			for (let i = 0; i < system.effects.length; i++) {
				let numParticles = Math.floor(system.effects[i].particlesPerSecond * elapsedTime / 1000);
				for (let j = 0; j < numParticles; j++) {
					let t = Math.random();
					let position = posFunc(t);

					let speed = Math.abs(engine.random.normalDist(system.effects[i].speed.mean, system.effects[i].speed.stdDev));

					let angle = angleFunc(t);
					if (system.effects[i].hasOwnProperty('angle')) {
						angle += engine.random.normalDist(system.effects[i].angle.mean, system.effects[i].angle.stdDev)
					}

					let lifetime = Math.abs(engine.random.normalDist(system.effects[i].lifetime.mean, system.effects[i].lifetime.stdDev));

					if (system.effects[i].hasOwnProperty('image')) {
						let scale = Math.abs(engine.random.normalDist(system.effects[i].scale.mean, system.effects[i].scale.stdDev));

						let rotation = Math.random() * 360;
						if (system.effects[i].hasOwnProperty('rotation')) {
							rotation = engine.random.normalDist(system.effects[i].rotation.mean, system.effects[i].rotation.stdDev);
						}

						let angularVelocity = 0;
						if (system.effects[i].hasOwnProperty('angularVelocity')) {
							angularVelocity = engine.random.normalDist(system.effects[i].angularVelocity.mean, system.effects[i].angularVelocity.stdDev);
						}

						system.effects[i].particles.unshift({
							position: {
								x: position.x,
								y: position.y
							},
							velocity: {
								x: speed * Math.cos(angle * Math.PI / 180),
								y: speed * Math.sin(angle * Math.PI / 180)
							},
							scale: scale,
							rotation: rotation,
							angularVelocity: angularVelocity,
							lifetime: lifetime
						});
					} else {
						let radius = Math.abs(engine.random.normalDist(system.effects[i].radius.mean, system.effects[i].radius.stdDev));

						system.effects[i].particles.unshift({
							position: {
								x: position.x,
								y: position.y
							},
							velocity: {
								x: speed * Math.cos(angle * Math.PI / 180),
								y: speed * Math.sin(angle * Math.PI / 180)
							},
							radius: radius,
							lifetime: lifetime
						});
					}
				}
			}
		};

		// system.createParticles = function(x, y, elapsedTime) {
		// 	for (let i = 0; i < system.effects.length; i++) {
		// 		let numParticles = Math.floor(system.effects[i].particlesPerSecond * elapsedTime / 1000);
		// 		for (let j = 0; j < numParticles; j++) {
		// 			let speed = Math.abs(engine.random.normalDist(system.effects[i].speed.mean, system.effects[i].speed.stdDev));

		// 			let angle = Math.random() * 360;
		// 			if (system.effects[i].hasOwnProperty('angle')) {
		// 				angle = engine.random.normalDist(system.effects[i].angle.mean, system.effects[i].angle.stdDev)
		// 			}

		// 			let lifetime = Math.abs(engine.random.normalDist(system.effects[i].lifetime.mean, system.effects[i].lifetime.stdDev));

		// 			if (system.effects[i].hasOwnProperty('image')) {
		// 				let scale = Math.abs(engine.random.normalDist(system.effects[i].scale.mean, system.effects[i].scale.stdDev));

		// 				let rotation = Math.random() * 360;
		// 				if (system.effects[i].hasOwnProperty('rotation')) {
		// 					rotation = engine.random.normalDist(system.effects[i].rotation.mean, system.effects[i].rotation.stdDev);
		// 				}

		// 				let angularVelocity = 0;
		// 				if (system.effects[i].hasOwnProperty('angularVelocity')) {
		// 					angularVelocity = engine.random.normalDist(system.effects[i].angularVelocity.mean, system.effects[i].angularVelocity.stdDev);
		// 				}

		// 				system.effects[i].particles.unshift({
		// 					position: {
		// 						x: x,
		// 						y: y
		// 					},
		// 					velocity: {
		// 						x: speed * Math.cos(angle * Math.PI / 180),
		// 						y: speed * Math.sin(angle * Math.PI / 180)
		// 					},
		// 					scale: scale,
		// 					rotation: rotation,
		// 					angularVelocity: angularVelocity,
		// 					lifetime: lifetime
		// 				});
		// 			} else {
		// 				let radius = Math.abs(engine.random.normalDist(system.effects[i].radius.mean, system.effects[i].radius.stdDev));

		// 				system.effects[i].particles.unshift({
		// 					position: {
		// 						x: x,
		// 						y: y
		// 					},
		// 					velocity: {
		// 						x: speed * Math.cos(angle * Math.PI / 180),
		// 						y: speed * Math.sin(angle * Math.PI / 180)
		// 					},
		// 					radius: radius,
		// 					lifetime: lifetime
		// 				});
		// 			}
		// 		}
		// 	}
		// };

		systems.push(system);

		return system;
	};

	engine.particleManager.update = function(elapsedTime) {
		for (let i = 0; i < systems.length; i++) {
			for (let j = 0; j < systems[i].effects.length; j++) {
				let keep = [];
				for (let k = 0; k < systems[i].effects[j].particles.length; k++) {
					let particle = systems[i].effects[j].particles[k];

					particle.position.x += particle.velocity.x * elapsedTime / 1000;
					particle.position.y += particle.velocity.y * elapsedTime / 1000;

					if (particle.hasOwnProperty('angularVelocity')) {
						particle.rotation += particle.angularVelocity * elapsedTime / 1000;
					}

					particle.lifetime -= elapsedTime / 1000;
					if (particle.lifetime > 0) {
						keep.push(particle);
					}
				}
				systems[i].effects[j].particles = keep;
			}
		}
	};

	engine.particleManager.render = function() {
		for (let i = 0; i < systems.length; i++) {
			for (let j = 0; j < systems[i].effects.length; j++) {
				let effect = systems[i].effects[j];
				if (effect.hasOwnProperty('image')) {
					for (let k = 0; k < effect.particles.length; k++) {
						let particle = effect.particles[k];
						let transformed = engine.particleManager.toScreenCoords(particle.position.x, particle.position.y);
						effect.image.draw(transformed.x,
										  transformed.y,
										  particle.scale,
										  particle.scale,
										  particle.rotation);
					}

				} else {
					for (let k = 0; k < effect.particles.length; k++) {
						let particle = effect.particles[k];
						let transformed = engine.particleManager.toScreenCoords(particle.position.x, particle.position.y);
						engine.graphics.drawCircle(transformed.x,
												   transformed.y,
												   particle.radius,
												   effect.stroke,
												   effect.fill);
					}
				}
			}
		}
	};

})();