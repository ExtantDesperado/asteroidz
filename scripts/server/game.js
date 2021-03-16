let present = require('present');
let fs = require('fs');
let Player = require('./player.js');

let HIGH_SCORES_FILE_NAME = 'highScores.json';
const MAX_HIGH_SCORES = 10;

const UPDATE_RATE_MS = 25;
let quit = false;
let lastUpdateTime = present();

let clients = {};			// All clients
let activeClients = {};		// Clients that are currently in the game

let asteroids = {};
let nextAsteroidId = 0;
const STARTING_NUM_ASTEROIDS = 5;
const MAX_ASTEROIDS = 10;
const ASTEROID_COUNTDOWN = 10;
let timeUntilNextAsteroid = ASTEROID_COUNTDOWN;

let projectiles = {};
let nextProjectileId = 0;

let ufos = {};
let nextUFOId = 0;
const MAX_UFOS = 1;
const UFO_COUNTDOWN = 30;
let timeUntilNextUFO = UFO_COUNTDOWN;

let ufoProjectiles = {};
let nextUFOProjectileId = 0;

let bounds = {
	x: {
		lower: 0,
		upper: 7
	},
	y: {
		lower: 0,
		upper: 5
	}
};

function randomNormal(mean, stdDev) {
	let u = Math.random();
	let v = Math.random();
	while (u == 0) { u = Math.random(); }			// u and v can't be 0.
	while (v == 0) { v = Math.random(); }
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stdDev + mean;
};

const asteroidRadius = {
	SMALL: 0.025,
	MEDIUM: 0.05,
	LARGE: 0.1
}

function initializeAsteroids() {
	asteroids = {};

	for (let i = 0; i < STARTING_NUM_ASTEROIDS; i++) {
		asteroids[nextAsteroidId] = {
			asteroidId: nextAsteroidId++,
			position: {
				x: Math.random() * (bounds.x.upper - bounds.x.lower) + bounds.x.lower,
				y: Math.random() * (bounds.y.upper - bounds.y.lower) + bounds.y.lower
			},
			velocity: {
				x: Math.random() * 0.2 - 0.1,
				y: Math.random() * 0.2 - 0.1
			},
			radius: asteroidRadius.LARGE,
			angle: Math.random() * 360
		};
	}
}

function createAsteroid() {
	let point = getRandomPerimeterPoint();
	asteroids[nextAsteroidId] = {
		asteroidId: nextAsteroidId,
		position: {
			x: point.x,
			y: point.y
		},
		velocity: {
			x: Math.random() * 0.2 - 0.1,
			y: Math.random() * 0.2 - 0.1
		},
		radius: asteroidRadius.LARGE,
		angle: Math.random() * 360
	};

	return asteroids[nextAsteroidId++];
}

function playerAsteroidHit(asteroidId, projectileId) {
	let newAsteroids = {};

	let newSize = asteroidRadius.SMALL;
	let maxSpeed = 0.3;
	let numNew = 0;
	let score = 50;

	if (asteroids[asteroidId].radius === asteroidRadius.LARGE) {
		newSize = asteroidRadius.MEDIUM;
		maxSpeed = 0.25;
		numNew = 3;
		score = 10;
	} else if (asteroids[asteroidId].radius === asteroidRadius.MEDIUM) {
		numNew = 2;
		score = 25;
	}

	activeClients[projectiles[projectileId].playerId].player.addToScore(score);

	for (let i = 0; i < numNew; i++) {
		let newAsteroid = {
			asteroidId: nextAsteroidId,
			position: {
				x: asteroids[asteroidId].position.x,
				y: asteroids[asteroidId].position.y
			},
			velocity: {
				x: (2 * Math.random() - 1) * maxSpeed,
				y: (2 * Math.random() - 1) * maxSpeed
			},
			radius: newSize,
			angle: Math.random() * 360
		};

		newAsteroids[nextAsteroidId] = newAsteroid;
		asteroids[nextAsteroidId++] = newAsteroid;
	}

	for (let id in activeClients) {
		activeClients[id].socket.emit('projectile-hit', {
			asteroidId: asteroidId,
			projectileId: projectileId,
			newAsteroids: newAsteroids,
			score: score
		});
	}

	delete asteroids[asteroidId];
	delete projectiles[projectileId];

	// if (Object.keys(asteroids).length === 0) {
	// 	let maxScore = 0;
	// 	let winnerIds = [];
	// 	for (let id in activeClients) {
	// 		if (activeClients[id].player.score === maxScore) {
	// 			winnerIds.push(id);
	// 		} else if (activeClients[id].player.score > maxScore) {
	// 			winnerIds = [id];
	// 			maxScore = activeClients[id].player.score;
	// 		}
	// 	}

	// 	for (let id in activeClients) {
	// 		activeClients[id].socket.emit('game-over', {
	// 			winnerIds: winnerIds
	// 		});
	// 	}

	// 	saveHighScores();
	// }
}

function ufoAsteroidHit(asteroidId, ufoProjectileId) {
	let newAsteroids = {};

	let newSize = asteroidRadius.SMALL;
	let maxSpeed = 0.3;
	let numNew = 0;
	let score = 50;

	if (asteroids[asteroidId].radius === asteroidRadius.LARGE) {
		newSize = asteroidRadius.MEDIUM;
		maxSpeed = 0.25;
		numNew = 3;
	} else if (asteroids[asteroidId].radius === asteroidRadius.MEDIUM) {
		numNew = 2;
	}

	for (let i = 0; i < numNew; i++) {
		let newAsteroid = {
			asteroidId: nextAsteroidId,
			position: {
				x: asteroids[asteroidId].position.x,
				y: asteroids[asteroidId].position.y
			},
			velocity: {
				x: (2 * Math.random() - 1) * maxSpeed,
				y: (2 * Math.random() - 1) * maxSpeed
			},
			radius: newSize,
			angle: Math.random() * 360
		};

		newAsteroids[nextAsteroidId] = newAsteroid;
		asteroids[nextAsteroidId++] = newAsteroid;
	}

	for (let id in activeClients) {
		activeClients[id].socket.emit('ufo-projectile-hit', {
			asteroidId: asteroidId,
			ufoProjectileId: ufoProjectileId,
			newAsteroids: newAsteroids,
		});
	}

	delete asteroids[asteroidId];
	// UFO projectiles break asteroids and keep going.
	// delete ufoProjectiles[ufoProjectileId];
}

let inputQueue = [];

function fireProjectile(playerId) {
	let projectile = {
		playerId: playerId,
		projectileId: nextProjectileId,
		position: {
			x: activeClients[playerId].player.position.x,
			y: activeClients[playerId].player.position.y
		},
		velocity: {
			x: Math.sin(activeClients[playerId].player.angle * Math.PI / 180),
			y: -Math.cos(activeClients[playerId].player.angle * Math.PI / 180)
		},
		angle: activeClients[playerId].player.angle,
		radius: 1 / 80,
		remainingLifetime: 1.0
	};
	projectiles[nextProjectileId++] = projectile;

	for (let id in activeClients) {
		activeClients[id].socket.emit('new-projectile', projectile);
	}
}

function createUFO(x, y) {
	let point = getRandomPerimeterPoint();
	ufos[nextUFOId] = {
		id: nextUFOId,
		position: {
			x: point.x,
			y: point.y
		},
		velocity: {
			x: 0,
			y: 0
		},
		radius: 0.1,
		speed: 0.25,
		stationaryTime: 5,
		remainingStationaryTime: 0.000001,
		timeBetweenShots: 2,
		timeUntilNextShot: 2,
		startingHealth: 10,
		remainingHealth: 10,
		goal: {
			x: 0,
			y: 0
		}
	};

	return ufos[nextUFOId++];
}

function processInput() {
	let inputToProcess = inputQueue;
	inputQueue = [];

	for (let input of inputToProcess) {
		if (activeClients.hasOwnProperty(input.id)) {
			activeClients[input.id].lastMessageId = input.data.messageId;
			switch(input.data.type) {
				case 'thrust':
					activeClients[input.id].player.thrust(input.data.elapsedTime, input.receiveTime - lastUpdateTime);
	                lastUpdateTime = input.receiveTime;
					break;
				case 'rotate-right':
					activeClients[input.id].player.rotateRight(input.data.elapsedTime);
					break;
				case 'rotate-left':
					activeClients[input.id].player.rotateLeft(input.data.elapsedTime);
					break;
				case 'shoot':
					if (activeClients[input.id].player.shoot()) {
						fireProjectile(input.id);
					}

					break;
				default:;
			}
		}
	}
}

// Get a point dist units outside of the map.
function getRandomPerimeterPoint(dist=0) {
	let rectWidth = bounds.x.upper - bounds.x.lower;
	let rectHeight = bounds.y.upper - bounds.y.lower;
	let rand = 2 * Math.random() * (rectWidth + rectHeight);

	if (rand < rectWidth) {
		return { x: rand + bounds.x.lower, y: bounds.y.lower - dist };
	}
	rand -= rectWidth;
	if (rand < rectWidth) {
		return { x: rand + bounds.x.lower, y: bounds.y.upper + dist };
	}
	rand -= rectWidth;

	if (rand < rectHeight) {
		return { x: bounds.x.lower - dist, y: rand + bounds.y.lower };
	}
	rand -= rectHeight
	return { x: bounds.x.upper + dist, y: rand + bounds.y.lower };
}

function updateAsteroids(elapsedTime) {
	for (let id in asteroids) {
		asteroids[id].position.x += asteroids[id].velocity.x * elapsedTime / 1000;
		asteroids[id].position.y += asteroids[id].velocity.y * elapsedTime / 1000;

		if (asteroids[id].position.x < bounds.x.lower - asteroids[id].radius) {
			asteroids[id].position.x = bounds.x.upper + asteroids[id].radius;
		} else if (asteroids[id].position.x > bounds.x.upper + asteroids[id].radius) {
			asteroids[id].position.x = bounds.x.lower - asteroids[id].radius;
		}

		if (asteroids[id].position.y < bounds.y.lower - asteroids[id].radius) {
			asteroids[id].position.y = bounds.y.upper + asteroids[id].radius;
		} else if (asteroids[id].position.y > bounds.y.upper + asteroids[id].radius) {
			asteroids[id].position.y = bounds.y.lower - asteroids[id].radius;
		}
	}

	if (Object.keys(activeClients).length > 0) {
		if (timeUntilNextAsteroid > 0 && Object.keys(asteroids).length < MAX_ASTEROIDS) {
			timeUntilNextAsteroid -= elapsedTime / 1000;
		}

		if (timeUntilNextAsteroid <= 0) {
			let newAsteroid = createAsteroid();

			for (let id in activeClients) {
				activeClients[id].socket.emit('new-asteroid', newAsteroid);
			}

			timeUntilNextAsteroid += ASTEROID_COUNTDOWN;
		}
	}
}

function updateProjectiles(elapsedTime) {
	for (let id in projectiles) {
		projectiles[id].position.x += projectiles[id].velocity.x * elapsedTime / 1000;
		projectiles[id].position.y += projectiles[id].velocity.y * elapsedTime / 1000;
		projectiles[id].remainingLifetime -= elapsedTime / 1000;

		if (projectiles[id].position.x < bounds.x.lower ||
			projectiles[id].position.x > bounds.x.upper ||
			projectiles[id].position.y < bounds.y.lower ||
			projectiles[id].position.y > bounds.y.upper) {

			delete projectiles[id];

		} else if (projectiles[id].remainingLifetime <= 0) {
			for (let clientId in activeClients) {
				activeClients[clientId].socket.emit('projectile-fade', {
					id: id
				});
			}

			delete projectiles[id];
		}
	}
}

function updateUFOProjectiles(elapsedTime) {
	for (let id in ufoProjectiles) {
		ufoProjectiles[id].position.x += ufoProjectiles[id].velocity.x * elapsedTime / 1000;
		ufoProjectiles[id].position.y += ufoProjectiles[id].velocity.y * elapsedTime / 1000;
		ufoProjectiles[id].remainingLifetime -= elapsedTime / 1000;

		if (ufoProjectiles[id].position.x < bounds.x.lower ||
			ufoProjectiles[id].position.x > bounds.x.upper ||
			ufoProjectiles[id].position.y < bounds.y.lower ||
			ufoProjectiles[id].position.y > bounds.y.upper) {

			delete ufoProjectiles[id];

		} else if (ufoProjectiles[id].remainingLifetime <= 0) {
			for (let clientId in activeClients) {
				activeClients[clientId].socket.emit('ufo-projectile-fade', {
					id: id
				});
			}

			delete ufoProjectiles[id];
		}
	}
}

function updateUFOs(elapsedTime) {
	for (let id in ufos) {
		if (ufos[id].remainingStationaryTime > 0) {
			ufos[id].remainingStationaryTime -= elapsedTime / 1000;

			if (ufos[id].remainingStationaryTime <= 0) {
				ufos[id].goal.x = Math.random() * (bounds.x.upper - bounds.x.lower) + bounds.x.lower;
				ufos[id].goal.y = Math.random() * (bounds.y.upper - bounds.y.lower) + bounds.y.lower;
				let dist = Math.sqrt(Math.pow(ufos[id].goal.x - ufos[id].position.x, 2) + Math.pow(ufos[id].goal.y - ufos[id].position.y, 2));
				ufos[id].velocity.x = ufos[id].speed * (ufos[id].goal.x - ufos[id].position.x) / dist;
				ufos[id].velocity.y = ufos[id].speed * (ufos[id].goal.y - ufos[id].position.y) / dist;

				for (let clientId in activeClients) {
					activeClients[clientId].socket.emit('ufo-start', {
						id: id,
						velocity: ufos[id].velocity
					});
				}
			}
		} else {
			if (Math.pow(ufos[id].goal.x - ufos[id].position.x, 2) + Math.pow(ufos[id].goal.y - ufos[id].position.y, 2) < 0.01) {
				ufos[id].velocity.x = 0;
				ufos[id].velocity.y = 0;
				ufos[id].remainingStationaryTime += ufos[id].stationaryTime;

				for (let clientId in activeClients) {
					activeClients[clientId].socket.emit('ufo-stop', {
						id: id,
						position: ufos[id].position
					});
				}
			} else {
				ufos[id].position.x += ufos[id].velocity.x * elapsedTime / 1000;
				ufos[id].position.y += ufos[id].velocity.y * elapsedTime / 1000;
			}
		}

		ufos[id].timeUntilNextShot -= elapsedTime / 1000;

		if (ufos[id].timeUntilNextShot <= 0) {
			ufos[id].timeUntilNextShot += ufos[id].timeBetweenShots;

			let angle = Math.random() * 360;

			let ufoProjectile = {
				ufoId: id,
				ufoProjectileId: nextUFOProjectileId,
				position: {
					x: ufos[id].position.x,
					y: ufos[id].position.y
				},
				velocity: {
					x: Math.sin(angle * Math.PI / 180),
					y: -Math.cos(angle * Math.PI / 180)
				},
				angle: angle,
				radius: 1 / 20,
				remainingLifetime: 1.0
			};

			ufoProjectiles[nextUFOProjectileId++] = ufoProjectile;

			for (let clientId in activeClients) {
				activeClients[clientId].socket.emit('new-ufo-projectile', ufoProjectile);
			}
		}
	}

	if (Object.keys(activeClients).length > 0) {
		if (timeUntilNextUFO > 0 && Object.keys(ufos).length < MAX_UFOS) {
			timeUntilNextUFO -= elapsedTime / 1000;
		}

		if (timeUntilNextUFO <= 0) {
			let newUfo = createUFO();

			for (let id in activeClients) {
				activeClients[id].socket.emit('new-ufo', newUfo);
			}

			timeUntilNextUFO += UFO_COUNTDOWN;
		}
	}
};

function respawn(playerId) {
	let respawnPoint = findSafePoint();
	activeClients[playerId].player.position.x = respawnPoint.x;
	activeClients[playerId].player.position.y = respawnPoint.y;
	activeClients[playerId].player.velocity.x = 0;
	activeClients[playerId].player.velocity.y = 0;
	activeClients[playerId].player.angle = Math.random() * 360;

	let respawnData = {
		id: playerId,
		position: activeClients[playerId].player.position,
		angle: activeClients[playerId].player.angle
	};

	activeClients[playerId].socket.emit('respawn-self', respawnData);

	for (let otherId in activeClients) {
		if (otherId !== playerId) {
			activeClients[otherId].socket.emit('respawn-other', respawnData);
		}
	}
}

function detectCollisions() {
	for (let asteroidId in asteroids) {
		// Asteroid - player collisions.
		for (let playerId in activeClients) {
			if (activeClients[playerId].player.alive) {
				if (Math.pow(activeClients[playerId].player.position.x - asteroids[asteroidId].position.x, 2) +
					Math.pow(activeClients[playerId].player.position.y - asteroids[asteroidId].position.y, 2) <=
					Math.pow(activeClients[playerId].player.radius + asteroids[asteroidId].radius, 2)) {

					activeClients[playerId].player.destroy(() => respawn(playerId));

					let scoreChange = -100
					activeClients[playerId].player.addToScore(scoreChange);

					activeClients[playerId].socket.emit('crash-self', {
						score: scoreChange
					});

					for (let otherId in activeClients) {
						if (otherId !== playerId) {
							activeClients[otherId].socket.emit('crash-other', {
								id: playerId,
								score: scoreChange
							});
						}
					}
				}
			}
		}

		// Asteroid - UFO collisions.
		for (let ufoId in ufos) {
			if (Math.pow(ufos[ufoId].position.x - asteroids[asteroidId].position.x, 2) +
				Math.pow(ufos[ufoId].position.y - asteroids[asteroidId].position.y, 2) <=
				Math.pow(asteroids[asteroidId].radius + ufos[ufoId].radius, 2)) {

				delete ufos[ufoId];

				for (let id in activeClients) {
					activeClients[id].socket.emit('ufo-destroyed', {
						ufoId: ufoId
					});
				}
			}
		}

		let asteroidDestroyed = false;

		// Asteroid - projectile collisions.
		for (let projectileId in projectiles) {
			if (Math.pow(projectiles[projectileId].position.x - asteroids[asteroidId].position.x, 2) +
				Math.pow(projectiles[projectileId].position.y - asteroids[asteroidId].position.y, 2) <=
				Math.pow(asteroids[asteroidId].radius + projectiles[projectileId].radius, 2)) {

				playerAsteroidHit(asteroidId, projectileId);
				asteroidDestroyed = true;
				break;
			}
		}

		if (!asteroidDestroyed) {
			// Asteroid - ufoProjectile collisions.
			for (let ufoProjectileId in ufoProjectiles) {
				if (Math.pow(ufoProjectiles[ufoProjectileId].position.x - asteroids[asteroidId].position.x, 2) +
					Math.pow(ufoProjectiles[ufoProjectileId].position.y - asteroids[asteroidId].position.y, 2) <=
					Math.pow(asteroids[asteroidId].radius + ufoProjectiles[ufoProjectileId].radius, 2)) {

					ufoAsteroidHit(asteroidId, ufoProjectileId);
					break;
				}
			}
		}
	}

	for (let ufoId in ufos) {
		// UFO - player collisions. (only player dies).
		for (let playerId in activeClients) {
			if (activeClients[playerId].player.alive) {
				if (Math.pow(activeClients[playerId].player.position.x - ufos[ufoId].position.x, 2) +
					Math.pow(activeClients[playerId].player.position.y - ufos[ufoId].position.y, 2) <=
					Math.pow(activeClients[playerId].player.radius + ufos[ufoId].radius, 2)) {

					activeClients[playerId].player.destroy(() => respawn(playerId));

					let scoreChange = -100
					activeClients[playerId].player.addToScore(scoreChange);

					activeClients[playerId].socket.emit('crash-self', {
						score: scoreChange
					});

					for (let otherId in activeClients) {
						if (otherId !== playerId) {
							activeClients[otherId].socket.emit('crash-other', {
								id: playerId,
								score: scoreChange
							});
						}
					}
				}
			}
		}

		// UFO - projectile collisions.
		for (let projectileId in projectiles) {
			if (Math.pow(projectiles[projectileId].position.x - ufos[ufoId].position.x, 2) +
				Math.pow(projectiles[projectileId].position.y - ufos[ufoId].position.y, 2) <=
				Math.pow(ufos[ufoId].radius + projectiles[projectileId].radius, 2)) {

				ufos[ufoId].remainingHealth -= 1;

				if (ufos[ufoId].remainingHealth <= 0) {
					delete ufos[ufoId];

					let score = 500;

					if (activeClients.hasOwnProperty(projectiles[projectileId].playerId)) {
						activeClients[projectiles[projectileId].playerId].player.addToScore(score);
					}

					for (let id in activeClients) {
						activeClients[id].socket.emit('ufo-destroyed', {
							ufoId: ufoId,
							projectileId: projectileId,
							score: score
						});
					}
				} else {
					for (let id in activeClients) {
						activeClients[id].socket.emit('ufo-hit', {
							ufoId: ufoId,
							projectileId: projectileId
						});
					}
				}

				delete projectiles[projectileId];

				break;
			}
		}
	}

	for (let playerId in activeClients) {
		if (activeClients[playerId].player.alive) {
			// Player - ufoProjectile collisions.
			for (let ufoProjectileId in ufoProjectiles) {
				if (Math.pow(activeClients[playerId].player.position.x - ufoProjectiles[ufoProjectileId].position.x, 2) +
					Math.pow(activeClients[playerId].player.position.y - ufoProjectiles[ufoProjectileId].position.y, 2) <=
					Math.pow(activeClients[playerId].player.radius + ufoProjectiles[ufoProjectileId].radius, 2)) {

					activeClients[playerId].player.destroy(() => respawn(playerId));

					let scoreChange = -100
					activeClients[playerId].player.addToScore(scoreChange);

					activeClients[playerId].socket.emit('crash-self', {
						score: scoreChange
					});

					for (let otherId in activeClients) {
						if (otherId !== playerId) {
							activeClients[otherId].socket.emit('crash-other', {
								id: playerId,
								score: scoreChange
							});
						}
					}
				}
			}
		}
	}
}

function update(elapsedTime) {
	for (let id in activeClients) {
        activeClients[id].player.update(elapsedTime);
		if (activeClients[id].player.alive) {
	        if (activeClients[id].player.position.x < bounds.x.lower - activeClients[id].player.radius ||
	        	activeClients[id].player.position.x > bounds.x.upper + activeClients[id].player.radius ||
	        	activeClients[id].player.position.y < bounds.y.lower - activeClients[id].player.radius ||
	        	activeClients[id].player.position.y > bounds.y.upper + activeClients[id].player.radius) {

				activeClients[id].player.destroy(() => respawn(id));

				let scoreChange = -100;
				activeClients[id].player.addToScore(scoreChange);

				activeClients[id].socket.emit('lost-self', {
					score: scoreChange
				});

				for (let otherId in activeClients) {
					if (otherId !== id) {
						activeClients[otherId].socket.emit('lost-other', {
							id: id,
							score: scoreChange
						})
					}
				}
			}
		}

    }

    updateAsteroids(elapsedTime);
    updateProjectiles(elapsedTime);
    updateUFOProjectiles(elapsedTime);
    updateUFOs(elapsedTime);
    detectCollisions();
}

function updateClients(elapsedTime) {
	for (let id in activeClients) {
		if (activeClients[id].player.reportUpdate) {
			let update = {
				id: id,
				position: activeClients[id].player.position,
				velocity: activeClients[id].player.velocity,
				angle: activeClients[id].player.angle,
				lastMessageId: activeClients[id].player.lastMessageId,
				updateWindow: elapsedTime
			}

			activeClients[id].socket.emit('update-self', update);

			for (let otherId in activeClients) {
				if (otherId !== id) {
					activeClients[otherId].socket.emit('update-other', update);
				}
			}

			activeClients[id].player.reportUpdate = false;
		}
	}

	lastUpdateTime = present();
}

function gameLoop(currentTime, elapsedTime) {
    processInput();
    update(elapsedTime);
    updateClients(elapsedTime);

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, UPDATE_RATE_MS);
    }
}

const safePointGridWidth = 5;
const safePointGridHeight = 5;

function findSafePoint() {
	let bestX = null;
	let bestY = null;
	let maxDist = 0;

	for (let i = 0; i < safePointGridHeight; i++) {
		let y = (i + 1) * (bounds.y.upper - bounds.y.lower) / (safePointGridHeight + 1);
		for (let j = 0; j < safePointGridWidth; j++) {
			let x = (j + 1) * (bounds.x.upper - bounds.x.lower) / (safePointGridWidth + 1);

			let minDistSquared = Infinity;
			for (let asteroidId in asteroids) {
				let distSquared = Math.pow(x - asteroids[asteroidId].position.x, 2) + Math.pow(y - asteroids[asteroidId].position.y, 2);
				if (distSquared < minDistSquared) {
					minDistSquared = distSquared;
				}
			}

			if (minDistSquared > maxDist) {
				maxDist = minDistSquared;
				bestX = x;
				bestY = y;
			}
		}
	}

	return { x: bestX, y: bestY };
}

// function saveHighScores() {
// 	fs.readFile(HIGH_SCORES_FILE_NAME, (err, data) => {
// 		let scoresList = [];
// 		if (err === null) {
// 			scoresList = JSON.parse(data);
// 		}

// 		for (let id in activeClients) {
// 			scoresList.push({
// 				name: activeClients[id].player.name,
// 				score: activeClients[id].player.score
// 			});
// 		}

// 		scoresList.sort((a, b) => { return b.score - a.score });

// 		while (scoresList.length > MAX_HIGH_SCORES) {
// 			scoresList.pop();
// 		}

// 		fs.writeFile(HIGH_SCORES_FILE_NAME, JSON.stringify(scoresList), (err) => {
// 			if (err) throw err;
// 			console.log('High scores saved');
// 		})
// 	});
// }

function saveScoreAndQuit(playerId) {
	fs.readFile(HIGH_SCORES_FILE_NAME, (err, data) => {
		let scoresList = [];
		if (err === null && data.length > 0) {
			scoresList = JSON.parse(data);
		}

		let score = {
			name: activeClients[playerId].player.name,
			score: activeClients[playerId].player.score
		};

		scoresList.push(score);

		scoresList.sort((a, b) => { return b.score - a.score });

		while (scoresList.length > MAX_HIGH_SCORES) {
			scoresList.pop();
		}

		fs.writeFile(HIGH_SCORES_FILE_NAME, JSON.stringify(scoresList), (err) => {
			if (err) throw err;
			console.log('High scores saved');
		});

		let index = scoresList.findIndex((i) => i === score);
		if (index !== -1) {
			// New high score (top 10)
		    activeClients[playerId].socket.emit('leave-ack', {
		    	record: index
		    });
		} else {
		    activeClients[playerId].socket.emit('leave-ack', {});
		}

		delete activeClients[playerId];

	    for (let id in activeClients) {
			activeClients[id].socket.emit('leave-other', {
				id: playerId
			});
	    }
		
	    if (Object.keys(activeClients).length === 0) {
	    	console.log('Ending game...');
	    	asteroids = {};
	    	projectiles = {};
	    	ufos = {};
	    	ufoProjectiles = {};
	    }
	});
}

function initialize(server) {
	let io = require('socket.io')(server);

	io.on('connection', function(socket) {
	    console.log('Client connected');

	    socket.emit('connect-ack', {});

	    clients[socket.id] = {
	    	id: socket.id,
	    	socket: socket,
	    	player: null,
	    	lastMessageId: 0
	    };

	    socket.on('join', function(data) {
	    	if (Object.keys(activeClients).length == 0) {
	    		console.log('Starting game...');
	    		initializeAsteroids();
	    		timeUntilNextUFO = UFO_COUNTDOWN;
	    		timeUntilNextAsteroid = ASTEROID_COUNTDOWN;
	    	}

	    	let startPoint = findSafePoint();
		    let player = Player.create(data.name, startPoint.x, startPoint.y);
		    clients[socket.id].player = player;
		    activeClients[socket.id] = clients[socket.id];
		    socket.emit('join-ack', {
		    	id: socket.id,
		    	name: player.name,
		    	position: player.position,
		    	velocity: player.velocity,
		    	angle: player.angle,
		    	radius: player.radius,
		    	asteroids: asteroids,
		    	projectiles: projectiles,
		    	ufos: ufos,
		    	bounds: bounds
		    });

		    for (let id in activeClients) {
		    	if (socket.id !== id) {
		    		activeClients[id].socket.emit('join-other', {
		    			id: socket.id,
		    			name: player.name,
		    			position: player.position,
		    			velocity: player.velocity,
		    			angle: player.angle,
		    			radius: player.radius,
		    			alive: player.alive,
		    			score: player.score
		    		});

		    		socket.emit('join-other', {
		    			id: id,
	    				name: activeClients[id].player.name,
		    			position: activeClients[id].player.position,
		    			velocity: activeClients[id].player.velocity,
		    			angle: activeClients[id].player.angle,
		    			radius: activeClients[id].player.radius,
		    			alive: activeClients[id].player.alive,
		    			score: activeClients[id].player.score
		    		});
		    	}
		    }
	    });

	    socket.on('input', function(data) {
	    	inputQueue.push({
                id: socket.id,
                data: data,
                receiveTime: present()
            });
	    });

	    socket.on('leave', function(data) {
	    	saveScoreAndQuit(socket.id);
	    });

	    socket.on('get-high-scores', function() {
	    	fs.readFile(HIGH_SCORES_FILE_NAME, (err, data) => {
				let scoresList = [];
				if (err === null) {
					scoresList = JSON.parse(data);
				}
				socket.emit('high-scores', { highScores: scoresList, maxHighScores: MAX_HIGH_SCORES });
			});
	    });

	    socket.on('disconnect', function() {
	        console.log('Client disconnected');

	        if (activeClients.hasOwnProperty(socket.id)) {
		        for (let id in activeClients) {
			    	if (socket.id !== id) {
			    		activeClients[id].socket.emit('leave-other', {
			    			id: socket.id
			    		});
		    		}
			    }
			}

	        delete activeClients[socket.id];

	        if (Object.keys(activeClients).length === 0) {
	        	console.log('Ending game...');
	        	asteroids = {};
	        	projectiles = {};
	        	ufos = {};
	        	ufoProjectiles = {};
	        }
	    });
	});

    gameLoop(present(), 0);
}

module.exports.initialize = initialize;