function createPlayer(playerName, x, y) {
	let position = {
		x: x,
		y: y
	};

	let velocity = {
		x: 0,
		y: 0
	};

	let name = playerName;

	let angle = Math.random() * 360;

	let speed = 100;

	let radius = 3 / 80;

	let rotationRate = 180;

	let thrustRate = 0.4;

	let firingRate = 2;
	let cooldown = 1 / firingRate;

	let alive = true;

	const RESPAWN_TIME = 3;
	let remainingRespawnTime = 0;

	let reportUpdate = false;

	let lastUpdateDiff = 0;

	let score = 0;

	let player = {
		get name() { return name; },
		get position() { return position; },
		get velocity() { return velocity; },
		get angle() { return angle; },
		get speed() { return speed; },
		get radius() { return radius; },
		get firingRate() { return firingRate; },
		get alive() { return alive; },
		set alive(value) { alive = value; },
		get rotationRate() { return rotationRate; },
		get reportUpdate() { return reportUpdate; },
		set reportUpdate(value) { reportUpdate = value; },
		get score() { return score; }
	};

	player.thrust = function(elapsedTime, updateDiff) {
		if (alive) {
			lastUpdateDiff += updateDiff;
			position.x += velocity.x * updateDiff / 1000;
			position.y += velocity.y * updateDiff / 1000;

			reportUpdate = true;
			velocity.x += thrustRate * Math.sin(angle * Math.PI / 180) * elapsedTime / 1000;
			velocity.y -= thrustRate * Math.cos(angle * Math.PI / 180) * elapsedTime / 1000;
		}
	};

	player.rotateRight = function(elapsedTime) {
		if (alive) {
			reportUpdate = true;
			angle += rotationRate * elapsedTime / 1000;
		}
	};

	player.rotateLeft = function(elapsedTime) {
		if (alive) {
			reportUpdate = true;
			angle -= rotationRate * elapsedTime / 1000;
		}
	};

	let respawnFunction = null;

	player.destroy = function(onRespawn) {
		if (alive) {
			alive = false;
			remainingRespawnTime = RESPAWN_TIME;
			respawnFunction = onRespawn;
		}
	};

	let remainingCooldown = 0;

	player.shoot = function() {
		if (remainingCooldown <= 0) {
			remainingCooldown = cooldown;
			return true;
		}

		return false;
	};

	player.addToScore = function(value) {
		score += value;
	}

	player.resetScore = function() {
		score = 0;
	}

	player.update = function(elapsedTime) {
		if (alive) {
			elapsedTime -= lastUpdateDiff;
			lastUpdateDiff = 0;

			position.x += velocity.x * elapsedTime / 1000;
			position.y += velocity.y * elapsedTime / 1000;

			remainingCooldown -= elapsedTime / 1000;
		} else {
			remainingRespawnTime -= elapsedTime / 1000;

			if (remainingRespawnTime <= 0) {
				alive = true;
				respawnFunction();

				reportUpdate = false;
				lastUpdateDiff = 0;
				remainingCooldown = 0;
			}
		}
	};

	return player;
}

module.exports.create = createPlayer;