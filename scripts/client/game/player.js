game.model.getPlayer = function(data, image) {
	let player = {
		id: data.id,
		name: data.name,
		position: data.position,
		velocity: data.velocity,
		angle: data.angle,
		radius: data.radius,
		alive: true,
		image: image,
		scale: data.radius * game.model.camera.width / 60,
		score: 0
	};

	let speed = 100;
	let rotationRate = 180;
	let thrustRate = 0.25;

	player.thrust = function(elapsedTime) {
		if (player.alive) {
			player.velocity.x += thrustRate * Math.sin(player.angle * Math.PI / 180) * elapsedTime / 1000;
			player.velocity.y -= thrustRate * Math.cos(player.angle * Math.PI / 180) * elapsedTime / 1000;
		}
	};

	player.rotateRight = function(elapsedTime) {
		if (player.alive) {
			player.angle += rotationRate * elapsedTime / 1000;
		}
	};

	player.rotateLeft = function(elapsedTime) {
		if (player.alive) {
			player.angle -= rotationRate * elapsedTime / 1000;
		}
	};

	player.destroy = function() {
		player.alive = false;
	}

	player.respawn = function(data) {
		player.alive = true;
		player.position.x = data.position.x;
		player.position.y = data.position.y;
		player.velocity.x = 0;
		player.velocity.y = 0;
		player.angle = data.angle;
	}

	player.update = function(elapsedTime) {
		if (player.alive) {
			player.position.x += player.velocity.x * elapsedTime / 1000;
			player.position.y += player.velocity.y * elapsedTime / 1000;
		}
	};

	player.render = function() {
		if (player.alive) {
			let transformed = game.model.camera.toScreenCoords(player.position.x, player.position.y);
			player.image.draw(transformed.x, transformed.y, player.scale, player.scale, player.angle);
			engine.graphics.drawText(player.name, transformed.x, transformed.y - 20, '15px arial', 'white', 'white');
		}
	};

	return player;
};

game.model.getRemotePlayer = function(data, image) {
	let player = {
		id: data.id,
		name: data.name,
		position: data.position,
		velocity: data.velocity,
		angle: data.angle,
		radius: data.radius,
		alive: data.alive,
		image: image,
		scale: data.radius * game.model.camera.width / 60,
		score: data.score
	};

	player.goal = {
		updateWindow: 0,
		position: {
			x: player.position.x,
			y: player.position.y
		},
		angle: player.angle
	}

	let speed = 100;
	let rotationRate = 180;

	player.destroy = function() {
		player.alive = false;
	}

	player.respawn = function(data) {
		player.alive = true;
		player.position.x = data.position.x;
		player.position.y = data.position.y;
		player.velocity.x = 0;
		player.velocity.y = 0;
		player.angle = data.angle;

		player.goal.updateWindow = 0;
		player.goal.position.x = player.position.x;
		player.goal.position.y = player.position.y;
		player.goal.angle = player.angle;
	}

	player.update = function(elapsedTime) {
		if (player.alive) {
	    	let goalTime = Math.min(elapsedTime, player.goal.updateWindow);

			if (goalTime > 0) {
				let updateFraction = goalTime / player.goal.updateWindow;
				player.angle += (player.goal.angle - player.angle) * updateFraction;
				player.position.x += (player.goal.position.x - player.position.x) * updateFraction;
				player.position.y += (player.goal.position.y - player.position.y) * updateFraction;

				player.goal.updateWindow -= goalTime;
			} else {
				player.position.x += player.velocity.x * elapsedTime / 1000;
				player.position.y += player.velocity.y * elapsedTime / 1000;
			}
		}
	};

	player.render = function() {
		if (player.alive) {
			let transformed = game.model.camera.toScreenCoords(player.position.x, player.position.y);
			player.image.draw(transformed.x, transformed.y, player.scale, player.scale, player.angle);
			engine.graphics.drawText(player.name, transformed.x, transformed.y - 20, '10px arial', 'white', 'white');
		}
	};

	return player;
};