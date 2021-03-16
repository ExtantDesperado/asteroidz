(function() {

	let shipImage = engine.graphics.getImage(game.assets['player']);

	game.model.player = null;
	game.model.otherPlayers = {};

	game.model.bounds = {};

	let asteroids = {};
	let projectiles = {};
	let ufos = {};
	let ufoProjectiles = {};

	let statusMessages = [];
	const STATUS_MESSAGE_TIME = 5;

	function updateAsteroids(elapsedTime) {
		for (let id in asteroids) {
			asteroids[id].position.x += asteroids[id].velocity.x * elapsedTime / 1000;
			asteroids[id].position.y += asteroids[id].velocity.y * elapsedTime / 1000;

			if (asteroids[id].position.x < game.model.bounds.x.lower - asteroids[id].radius) {
				asteroids[id].position.x = game.model.bounds.x.upper + asteroids[id].radius;
			} else if (asteroids[id].position.x > game.model.bounds.x.upper + asteroids[id].radius) {
				asteroids[id].position.x = game.model.bounds.x.lower - asteroids[id].radius;
			}

			if (asteroids[id].position.y < game.model.bounds.y.lower - asteroids[id].radius) {
				asteroids[id].position.y = game.model.bounds.y.upper + asteroids[id].radius;
			} else if (asteroids[id].position.y > game.model.bounds.y.upper + asteroids[id].radius) {
				asteroids[id].position.y = game.model.bounds.y.lower - asteroids[id].radius;
			}
		}
	}

	function updateProjectiles(elapsedTime) {
		for (let id in projectiles) {
			projectiles[id].position.x += projectiles[id].velocity.x * elapsedTime / 1000;
			projectiles[id].position.y += projectiles[id].velocity.y * elapsedTime / 1000;

			if (projectiles[id].position.x < game.model.bounds.x.lower ||
				projectiles[id].position.x > game.model.bounds.x.upper ||
				projectiles[id].position.y < game.model.bounds.y.lower ||
				projectiles[id].position.y > game.model.bounds.y.upper) {

				delete projectiles[id];
			}
		}
	}

	function updateUFOProjectiles(elapsedTime) {
		for (let id in ufoProjectiles) {
			ufoProjectiles[id].position.x += ufoProjectiles[id].velocity.x * elapsedTime / 1000;
			ufoProjectiles[id].position.y += ufoProjectiles[id].velocity.y * elapsedTime / 1000;

			if (ufoProjectiles[id].position.x < game.model.bounds.x.lower ||
				ufoProjectiles[id].position.x > game.model.bounds.x.upper ||
				ufoProjectiles[id].position.y < game.model.bounds.y.lower ||
				ufoProjectiles[id].position.y > game.model.bounds.y.upper) {

				delete ufoProjectiles[id];
			}
		}
	}

	function updateUFOs(elapsedTime) {
		for (let id in ufos) {
			ufos[id].angle += 90 * elapsedTime / 1000;

			ufos[id].position.x += ufos[id].velocity.x * elapsedTime / 1000;
			ufos[id].position.y += ufos[id].velocity.y * elapsedTime / 1000;
		}
	}

	function updateStatusMessages(elapsedTime) {
		for (let i = 0; i < statusMessages.length; i++) {
			statusMessages[i].time -= elapsedTime / 1000;
			if (statusMessages[i].time <= 0) {
				statusMessages.splice(i, 1);
			}
		}
	}

	game.model.update = function(elapsedTime) {
		game.model.player.update(elapsedTime);
		for (let id in game.model.otherPlayers) {
			game.model.otherPlayers[id].update(elapsedTime);
		}

		game.model.camera.update();

		// for (let i = 0; i < asteroids.length; i++) {
			game.sprites.asteroidAnimation.update(elapsedTime);
		// }

		updateAsteroids(elapsedTime);
		updateProjectiles(elapsedTime);
		updateUFOProjectiles(elapsedTime);
		updateUFOs(elapsedTime);
		updateStatusMessages(elapsedTime);
		game.sprites.updateExplosions(elapsedTime);
	};

	let ufoImage = engine.graphics.getImage(game.assets['ufo']);

	function renderUFOs() {
		for (let id in ufos) {
			let transformed = game.model.camera.toScreenCoords(ufos[id].position.x, ufos[id].position.y);
			ufoImage.draw(transformed.x, transformed.y, ufos[id].scale, ufos[id].scale, ufos[id].angle);

			let healthBarWidth = 50;
			let remainingHealthWidth = healthBarWidth * ufos[id].remainingHealth / ufos[id].startingHealth;
			engine.graphics.drawRect(transformed.x, transformed.y, remainingHealthWidth, 10, 0, 'black', 'red');
		}
	}

	let playerLaserSprite = game.sprites.laserSpriteManager.getSprite(4);

	function renderProjectiles() {
		for (let id in projectiles) {
			let transformed = game.model.camera.toScreenCoords(projectiles[id].position.x, projectiles[id].position.y);
			playerLaserSprite.draw(transformed.x, transformed.y, 1, 1, projectiles[id].angle);
		}
	}

	let ufoLaserSprite = game.sprites.laserSpriteManager.getSprite(6);

	function renderUFOProjectiles() {
		for (let id in ufoProjectiles) {
			let transformed = game.model.camera.toScreenCoords(ufoProjectiles[id].position.x, ufoProjectiles[id].position.y);
			ufoLaserSprite.draw(transformed.x, transformed.y, 1, 1, ufoProjectiles[id].angle);
		}
	}

	function renderMinimap() {
		let ratio = (game.model.bounds.y.upper - game.model.bounds.y.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower);
		let width = engine.canvas.width / 6;
		let height = width * ratio;
		let offsetX = engine.canvas.width - width;
		engine.graphics.drawRect(width / 2 + offsetX, height / 2, width, height, 0, 'rgba(0, 255, 255, 1)', 'rgba(0, 255, 255, 0.75)');

		engine.graphics.drawRect((game.model.camera.position.x - game.model.bounds.x.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower) * width + offsetX,
								 (game.model.camera.position.y - game.model.bounds.y.lower) / (game.model.bounds.y.upper - game.model.bounds.y.lower) * height,
								 width / (game.model.bounds.x.upper - game.model.bounds.x.lower),
								 height / (game.model.bounds.y.upper - game.model.bounds.y.lower),
								 0, 'white', '');

		for (let asteroidId in asteroids) {
			engine.graphics.drawCircle((asteroids[asteroidId].position.x - game.model.bounds.x.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower) * width + offsetX,
									   (asteroids[asteroidId].position.y - game.model.bounds.y.lower) / (game.model.bounds.y.upper - game.model.bounds.y.lower) * height,
									   2, 'gray', 'gray');
		}

		for (let id in game.model.otherPlayers) {
			if (game.model.otherPlayers[id].alive) {
				engine.graphics.drawCircle((game.model.otherPlayers[id].position.x - game.model.bounds.x.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower) * width + offsetX,
										   (game.model.otherPlayers[id].position.y - game.model.bounds.y.lower) / (game.model.bounds.y.upper - game.model.bounds.y.lower) * height,
										   2, 'blue', 'blue');
			}
		}

		for (let id in ufos) {
			engine.graphics.drawCircle((ufos[id].position.x - game.model.bounds.x.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower) * width + offsetX,
									   (ufos[id].position.y - game.model.bounds.y.lower) / (game.model.bounds.y.upper - game.model.bounds.y.lower) * height,
									   2, 'red', 'red')
		}

		if (game.model.player.alive) {
			engine.graphics.drawCircle((game.model.player.position.x - game.model.bounds.x.lower) / (game.model.bounds.x.upper - game.model.bounds.x.lower) * width + offsetX,
									   (game.model.player.position.y - game.model.bounds.y.lower) / (game.model.bounds.y.upper - game.model.bounds.y.lower) * height,
									   3, 'lime', 'lime');
		}
	}

	function renderScoreboard() {
		let offset = 0;
		engine.graphics.drawTextTopLeft(game.model.player.name + ': ' + game.model.player.score, 0, offset, '15px arial', 'white', 'white');
		for (let id in game.model.otherPlayers) {
			offset += 15;
			engine.graphics.drawTextTopLeft(game.model.otherPlayers[id].name + ': ' + game.model.otherPlayers[id].score, 0, offset, '15px arial', 'white', 'white');
		}
	}

	function renderStatusMessages() {
		let offset = 10;
		for (let i = 0; i < statusMessages.length; i++) {
			engine.graphics.drawText(statusMessages[i].message, game.model.camera.width / 2, offset, '15px arial', 'white', 'white');
			offset += 15;
		}
	}

	game.model.render = function(elapsedTime) {
		engine.graphics.drawRect(engine.canvas.width / 2, engine.canvas.height / 2,
			engine.canvas.width, engine.canvas.height, 0, 'black', 'black');

		game.model.renderBackground();

		renderProjectiles();
		renderUFOProjectiles();

		renderUFOs();
		game.model.player.render();

		for (let id in game.model.otherPlayers) {
			game.model.otherPlayers[id].render();
		}

		for (let asteroidId in asteroids) {
			let transformed = game.model.camera.toScreenCoords(asteroids[asteroidId].position.x, asteroids[asteroidId].position.y);
			game.sprites.asteroidAnimation.draw(transformed.x, transformed.y, asteroids[asteroidId].scale, asteroids[asteroidId].scale, asteroids[asteroidId].angle);
		}

		renderMinimap();
		renderScoreboard();
		renderStatusMessages();

		game.sprites.renderExplosions();
	};

	engine.network.socket.on('connect-ack', function(data) {

	});

	engine.network.socket.on('join-ack', function(data) {
		asteroids = data.asteroids;
		projectiles = data.projectiles;
		ufos = data.ufos;

		for (let asteroidId in asteroids) {
			asteroids[asteroidId].scale = asteroids[asteroidId].radius * game.model.camera.width * 3 / 128;
		}

		for (let ufoId in ufos) {
			ufos[ufoId].scale = ufos[ufoId].radius * game.model.camera.width / 120;
			ufos[ufoId].angle = 0;
		}

		game.sprites.asteroidAnimation.start();

		game.model.bounds = data.bounds;
		game.model.initializeBackground();

		game.model.player = game.model.getPlayer(data, shipImage);
		game.model.otherPlayers = {};
		engine.screenManager.changeScreen('gameScreen');
		game.model.camera.setPosition(game.model.player.position.x, game.model.player.position.y);
		engine.startGameLoop();
	});

	engine.network.socket.on('join-other', function(data) {
		console.log('Player joined:', data.id);
		let player = game.model.getRemotePlayer(data, shipImage);
		player.goal = {
			updateWindow: 0,
			position: {
				x: player.position.x,
				y: player.position.y
			},
			angle: player.angle
		};

		game.model.otherPlayers[data.id] = player;

		statusMessages.push({
			message: player.name + ' joined the game.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('leave-ack', function(data) {
		asteroids = {};
		ufos = {};
		projectiles = {};
		ufoProjectiles = {};

		if (data.hasOwnProperty('record')) {
			engine.screenManager.changeScreen('highScoresScreen');
		} else {
			engine.screenManager.changeScreen('homeScreen');
		}

		engine.stopGameLoop();
	});

	engine.network.socket.on('leave-other', function(data) {
		console.log('Player left:', data.id);

		statusMessages.push({
			message: game.model.otherPlayers[data.id].name + ' left the game.',
			time: STATUS_MESSAGE_TIME
		});

		delete game.model.otherPlayers[data.id];
	});

	let messageHistory = [];

	engine.network.socket.on('update-self', function(data) {
		game.model.player.velocity.x = data.velocity.x;
		game.model.player.velocity.y = data.velocity.y;
		game.model.player.position.x = data.position.x;
		game.model.player.position.y = data.position.y;
		game.model.player.angle = data.angle;

		let done = false;
		while (!done && messageHistory.length > 0) {
			if (messageHistory[0].messageId === data.lastMessageId) {
				done = true;
			}
			messageHistory.shift();
		}

		let memory = [];

		while (messageHistory.length !== 0) {
			let message = messageHistory.shift();

			switch (message.type) {
				case 'thrust':
					game.model.player.thrust(message.elapsedTime);
					break;
				case 'rotate-right':
					game.model.player.rotateRight(message.elapsedTime);
					break;
				case 'rotate-left':
					game.model.player.rotateLeft(message.elapsedTime);
					break;
				default:;
			}

			memory.push(message);
		}

		messageHistory = memory;
	});

	engine.network.socket.on('update-other', function(data) {
		game.model.otherPlayers[data.id].goal.updateWindow = data.updateWindow;
		game.model.otherPlayers[data.id].goal.angle = data.angle;
		game.model.otherPlayers[data.id].goal.position.x = data.position.x;
		game.model.otherPlayers[data.id].goal.position.y = data.position.y;
		game.model.otherPlayers[data.id].velocity.x = data.velocity.x;
		game.model.otherPlayers[data.id].velocity.y = data.velocity.y;
	});

	let playerExplosionSound = engine.audioManager.getMultiChannel(game.assets['ship-explosion'], 4);

	engine.network.socket.on('crash-self', function(data) {
		if (!game.muted) {
			playerExplosionSound.play();
		}
		game.sprites.createExplosion(game.model.player.position.x, game.model.player.position.y);
		game.particles.playerExplosionParticleSystem.createParticles(() => game.model.player.position, () => Math.random() * 360, 1);
		game.model.player.destroy();
		game.model.player.score += data.score;

		statusMessages.push({
			message: 'You crashed. Good job.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('crash-other', function(data) {
		if (game.model.camera.isInScreen(game.model.otherPlayers[data.id].position.x, game.model.otherPlayers[data.id].position.y)) {
			if (!game.muted) {
				playerExplosionSound.play();
			}
		}
		game.sprites.createExplosion(game.model.otherPlayers[data.id].position.x, game.model.otherPlayers[data.id].position.y);
		game.particles.playerExplosionParticleSystem.createParticles(() => game.model.otherPlayers[data.id].position, () => Math.random() * 360, 1);
		game.model.otherPlayers[data.id].destroy();
		game.model.otherPlayers[data.id].score += data.score;

		statusMessages.push({
			message: game.model.otherPlayers[data.id].name + ' crashed.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('lost-self', function(data) {
		game.model.player.destroy();
		game.model.player.score += data.score;

		statusMessages.push({
			message: 'You were lost in space.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('lost-other', function(data) {
		game.model.otherPlayers[data.id].destroy();
		game.model.otherPlayers[data.id].score += data.score;

		statusMessages.push({
			message: game.model.otherPlayers[data.id].name + ' was lost in space.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('respawn-self', function(data) {
		game.model.player.respawn(data);
	});

	engine.network.socket.on('respawn-other', function(data) {
		game.model.otherPlayers[data.id].respawn(data);
	});

	engine.network.socket.on('new-asteroid', function(data) {
		asteroids[data.asteroidId] = data;
		asteroids[data.asteroidId].scale = asteroids[data.asteroidId].radius * game.model.camera.width * 3 / 128;
	});

	let playerLaserSound = engine.audioManager.getMultiChannel(game.assets['player-laser-sound'], 4);
	playerLaserSound.setVolume(0.2);

	engine.network.socket.on('new-projectile', function(data) {
		projectiles[data.projectileId] = data;
		if (game.model.camera.isInScreen(data.position.x, data.position.y)) {
			if (!game.muted) {
				playerLaserSound.play();
			}
		}
	});

	let asteroidExplosionSound = engine.audioManager.getMultiChannel(game.assets['asteroid-explosion'], 4);

	engine.network.socket.on('projectile-hit', function(data) {
		if (game.model.player.id === projectiles[data.projectileId].playerId) {
			game.model.player.score += data.score;
		} else {
			game.model.otherPlayers[projectiles[data.projectileId].playerId].score += data.score;
		}

		for (let id in data.newAsteroids) {
			asteroids[id] = data.newAsteroids[id];
			asteroids[id].scale = asteroids[id].radius * game.model.camera.width * 3 / 128;
		}

		if (game.model.camera.isInScreen(asteroids[data.asteroidId].position.x, asteroids[data.asteroidId].position.y)) {
			if (!game.muted) {
				asteroidExplosionSound.play();
			}
		}

		game.particles.asteroidBreakParticleSystem.createParticles(() => asteroids[data.asteroidId].position, () => Math.random() * 360, 1);

		delete asteroids[data.asteroidId];
		delete projectiles[data.projectileId];
	});

	engine.network.socket.on('projectile-fade', function(data) {
		delete projectiles[data.id];
	});

	let ufoLaserSound = engine.audioManager.getMultiChannel(game.assets['ufo-laser-sound'], 4);

	engine.network.socket.on('new-ufo-projectile', function(data) {
		ufoProjectiles[data.ufoProjectileId] = data;
		if (game.model.camera.isInScreen(data.position.x, data.position.y)) {
			if (!game.muted) {
				ufoLaserSound.play();
			}
		}
	});

	engine.network.socket.on('ufo-projectile-hit', function(data) {
		for (let id in data.newAsteroids) {
			asteroids[id] = data.newAsteroids[id];
			asteroids[id].scale = asteroids[id].radius * game.model.camera.width * 3 / 128;
		}

		if (game.model.camera.isInScreen(asteroids[data.asteroidId].position.x, asteroids[data.asteroidId].position.y)) {
			if (!game.muted) {
				asteroidExplosionSound.play();
			}
		}

		game.particles.asteroidBreakParticleSystem.createParticles(() => asteroids[data.asteroidId].position, () => Math.random() * 360, 1);

		delete asteroids[data.asteroidId];
		// UFO projectiles break asteroids and keep going.
		// delete ufoProjectiles[data.ufoProjectileId];
	});

	engine.network.socket.on('ufo-projectile-fade', function(data) {
		delete ufoProjectiles[data.id];
	});

	let ufoSpawnSound = engine.audioManager.getMultiChannel(game.assets['ufo-spawn'], 1);

	engine.network.socket.on('new-ufo', function(data) {
		ufos[data.id] = data;
		ufos[data.id].scale = ufos[data.id].radius * game.model.camera.width / 120;
		ufos[data.id].angle = 0;

		if (!game.muted) {
			ufoSpawnSound.play();
		}

		statusMessages.push({
			message: 'A hostile UFO approaches.',
			time: STATUS_MESSAGE_TIME
		});
	});

	engine.network.socket.on('ufo-hit', function(data) {
		ufos[data.ufoId].remainingHealth -= 1;

		delete projectiles[data.projectileId];
	});

	engine.network.socket.on('ufo-destroyed', function(data) {
		if (game.model.camera.isInScreen(ufos[data.ufoId].position.x, ufos[data.ufoId].position.y)) {
			if (!game.muted) {
				playerExplosionSound.play();
			}
		}
		game.sprites.createExplosion(ufos[data.ufoId].position.x, ufos[data.ufoId].position.y);
		game.particles.playerExplosionParticleSystem.createParticles(() => ufos[data.ufoId].position, () => Math.random() * 360, 1);

		// If UFO was destroyed by a player.
		if (data.hasOwnProperty('projectileId')) {
			if (projectiles[data.projectileId].playerId === game.model.player.id) {
				game.model.player.score += data.score;
				name = game.model.player.name;

				statusMessages.push({
					message: 'You eliminated a UFO.',
					time: STATUS_MESSAGE_TIME
				});
			} else {
				if (game.model.otherPlayers.hasOwnProperty(projectiles[data.projectileId].playerId)) {
					game.model.otherPlayers[projectiles[data.projectileId].playerId].score += data.score;

					statusMessages.push({
						message: game.model.otherPlayers[projectiles[data.projectileId].playerId].name + ' eliminated a UFO.',
						time: STATUS_MESSAGE_TIME
					});
				}
			}

			delete projectiles[data.projectileId];
		} else {
			statusMessages.push({
				message: 'Enemy UFO crashed.',
				time: STATUS_MESSAGE_TIME
			});
		}

		delete ufos[data.ufoId];
	});

	engine.network.socket.on('ufo-start', function(data) {
		ufos[data.id].velocity.x = data.velocity.x;
		ufos[data.id].velocity.y = data.velocity.y;
	});

	engine.network.socket.on('ufo-stop', function(data) {
		ufos[data.id].velocity.x = 0;
		ufos[data.id].velocity.y = 0;
		ufos[data.id].position.x = data.position.x;
		ufos[data.id].position.y = data.position.y;
	});

	// Not using this. Game runs continuously until everyone quits.
	// engine.network.socket.on('game-over', function(data) {
	// 	console.log('Game over. Winners:');
	// 	for (let i = 0; i < data.winnerIds.length; i++) {
	// 		if (data.winnerIds[i] === game.model.player.id) {
	// 			console.log('You win!');
	// 		} else {
	// 			console.log(game.model.otherPlayers[data.winnerIds[i]].name + ' wins!');
	// 		}
	// 	}
	// });

	let messageId = 1;

	game.model.emitThrust = function(elapsedTime) {
		let message = { type: 'thrust', elapsedTime: elapsedTime, messageId: messageId++ };
		messageHistory.push(message);
		game.model.player.thrust(elapsedTime);
		engine.network.socket.emit('input', message);
		// game.particles.playerThrustParticleSystem.createParticles(() => game.model.player.position, () => game.model.player.angle, elapsedTime);
	};

	game.model.emitRotateLeft = function(elapsedTime) {
		let message = { type: 'rotate-left', elapsedTime: elapsedTime, messageId: messageId++ };
		messageHistory.push(message);
		game.model.player.rotateLeft(elapsedTime);
		engine.network.socket.emit('input', message);
	};

	game.model.emitRotateRight = function(elapsedTime) {
		let message = { type: 'rotate-right', elapsedTime: elapsedTime, messageId: messageId++ };
		messageHistory.push(message);
		game.model.player.rotateRight(elapsedTime);
		engine.network.socket.emit('input', message);
	};

	game.model.emitShoot = function(elapsedTime) {
		let message = { type: 'shoot', elapsedTime: elapsedTime, messageId: messageId++ };
		messageHistory.push(message);

		engine.network.socket.emit('input', message);
	};

    engine.registerGame(game);

	game.controls = engine.storage.load('controls');
	if (game.controls === null) {
		game.controls = {
			thrust: 'ArrowUp',
			rotateLeft: 'ArrowLeft',
			rotateRight: 'ArrowRight',
			shoot: ' '
		}
	}

	engine.inputManager.keyboard.registerContinuous(game.controls.thrust, game.model.emitThrust);
	engine.inputManager.keyboard.registerContinuous(game.controls.rotateLeft, game.model.emitRotateLeft);
	engine.inputManager.keyboard.registerContinuous(game.controls.rotateRight, game.model.emitRotateRight);
	engine.inputManager.keyboard.registerContinuous(game.controls.shoot, game.model.emitShoot);
})();