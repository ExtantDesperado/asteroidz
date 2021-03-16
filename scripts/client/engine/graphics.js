(function() {

	let context = engine.canvas.getContext('2d');

	engine.graphics.contextSave = function() {
		context.save();
	};

	engine.graphics.contextRestore = function() {
		context.restore();
	};

	engine.graphics.translate = function(x, y) {
		context.translate(x, y);
	};

	engine.graphics.scale = function(sx, sy) {
		context.scale(sx, sy);
	};

	engine.graphics.getImage = function(source) {
		let image = null;

		if (typeof(source) === 'string') {
			image = new Image();
			image.isReady = false;

			image.onload = function() {
				image.isReady = true;
			};

			image.src = source;
		} else {
			image = source;
			image.isReady = true;
		}

		image.draw = function(centerX, centerY, scaleX, scaleY, rotation) {
			if (image.isReady) {
				context.save();

				context.translate(centerX, centerY);
		        context.rotate(rotation * Math.PI / 180);
		        context.translate(-centerX, -centerY);

		        let width = image.width * scaleX;
		        let height = image.height * scaleY;

		        context.drawImage(
		            image,
		            centerX - width / 2,
		            centerY - height / 2,
		            width, height);

				context.restore();
			}
		};

		return image;
	};

	engine.graphics.clear = function() {
		context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
	};

	engine.graphics.drawCircle = function(centerX, centerY, radius, strokeStyle, fillStyle) {
		context.save();

		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
		context.closePath();

		if (strokeStyle !== '') {
			context.strokeStyle = strokeStyle;
			context.stroke();
		}

		if (fillStyle !== '') {
			context.fillStyle = fillStyle;
			context.fill();
		}

		context.restore();
	};

	engine.graphics.drawRect = function(centerX, centerY, width, height, rotation, strokeStyle, fillStyle) {
		context.save();

		context.translate(centerX, centerY);
        context.rotate(rotation * Math.PI / 180);
        context.translate(-centerX, -centerY);

		if (strokeStyle !== '') {
			context.strokeStyle = strokeStyle;
			context.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
		}

		if (fillStyle !== '') {
			context.fillStyle = fillStyle;
			context.fillRect(centerX - width / 2, centerY - height / 2, width, height);
		}

		context.restore();
	};

	// Centered
	engine.graphics.drawText = function(text, centerX, centerY, fontStyle, strokeStyle, fillStyle) {
		context.save();

		context.font = fontStyle;
		context.textBaseline = 'top';

		let width = context.measureText(text).width;
		let height = context.measureText('M').width;

		if (strokeStyle !== '') {
			context.strokeStyle = strokeStyle;
			context.strokeText(text, centerX - width / 2, centerY - height / 2);
		}

		if (fillStyle !== '') {
			context.fillStyle = fillStyle;
			context.fillText(text, centerX - width / 2, centerY - height / 2);
		}

		context.restore();
	};

	engine.graphics.drawTextTopLeft = function(text, topleftX, topleftY, fontStyle, strokeStyle, fillStyle) {
		context.save();

		context.font = fontStyle;
		context.textBaseline = 'top';

		let width = context.measureText(text).width;
		let height = context.measureText('M').width;

		if (strokeStyle !== '') {
			context.strokeStyle = strokeStyle;
			context.strokeText(text, topleftX, topleftY);
		}

		if (fillStyle !== '') {
			context.fillStyle = fillStyle;
			context.fillText(text, topleftX, topleftY);
		}

		context.restore();
	};

	engine.graphics.getSpriteSheetManager = function(source, spriteSpecs) {
		let manager = {
			spriteSpecs: spriteSpecs
		};

		let spriteSheet = engine.graphics.getImage(source);

		function drawSprite(index, centerX, centerY, scaleX, scaleY, rotation) {
			context.save();

			context.translate(centerX, centerY);
	        context.rotate(rotation * Math.PI / 180);
	        context.translate(-centerX, -centerY);

	        let newWidth = spriteSpecs[index].width * scaleX;
	        let newHeight = spriteSpecs[index].height * scaleY;

	        context.drawImage(spriteSheet,
	        	spriteSpecs[index].topLeft.x, spriteSpecs[index].topLeft.y,
	        	spriteSpecs[index].width, spriteSpecs[index].height,
	        	centerX - newWidth / 2, centerY - newHeight / 2,
	        	newWidth, newHeight);

			context.restore();
		};

		manager.getAnimation = function(animationSpecs, looping) {
			let animation = {
				specs: animationSpecs
			};

			let running = false;

			let currentSprite = 0;
			let animationTime = 0;

			animation.reset = function() {
				currentSprite = 0;
				animationTime = 0;
			};

			animation.start = function() {
				running = true;
			};

			animation.update = function(elapsedTime) {
				if (running) {
					animationTime += elapsedTime / 1000;

					if (animationTime >= animation.specs[currentSprite].time) {
						if (!looping && currentSprite === animation.specs.length - 1) {
							running = false;
							animationTime = 0;
						} else {
							animationTime -= animation.specs[currentSprite].time;
						}

						currentSprite = (currentSprite + 1) % animation.specs.length;
					}
				}

				return running;
			};

			animation.draw = function(centerX, centerY, scaleX, scaleY, rotation) {
				drawSprite(animation.specs[currentSprite].sprite, centerX, centerY, scaleX, scaleY, rotation);
			};

			return animation;
		};

		manager.getSprite = function(index) {
			let sprite = {
				width: spriteSpecs[0].width,
				height: spriteSpecs[0].height
			};

			sprite.draw = function(centerX, centerY, scaleX, scaleY, rotation) {
				drawSprite(index, centerX, centerY, scaleX, scaleY, rotation);
			}

			return sprite;
		}

		return manager;
	};

})();