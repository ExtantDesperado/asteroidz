(function() {

	let gameMusic = engine.audioManager.getMultiChannel(game.assets['game-music'], 1, true);
	let menuMusic = engine.audioManager.getMultiChannel(game.assets['menu-music'], 1, true);
	menuMusic.setVolume(0.1);

	let menuMoveSound = engine.audioManager.getMultiChannel(game.assets['menu-move'], 2);
	let menuClickSound = engine.audioManager.getMultiChannel(game.assets['menu-click'], 2);
	menuClickSound.setVolume(0.2);
	let menuBackSound = engine.audioManager.getMultiChannel(game.assets['menu-back'], 2);

	game.assets['muted'].width = 25;
	game.assets['unmuted'].width = 25;

	let toggleMuteButton = document.getElementById('toggleMuteButton');
	toggleMuteButton.appendChild(game.assets['muted']);

	toggleMuteButton.onclick = function() {
		toggleMuteButton.blur();
		if (game.muted) {
			game.muted = false;
			toggleMuteButton.removeChild(game.assets['muted']);
			toggleMuteButton.appendChild(game.assets['unmuted']);
			if (engine.screenManager.currentScreen === 'gameScreen') {
				gameMusic.play();
			} else {
				menuMusic.play();
			}
		} else {
			game.muted = true;
			toggleMuteButton.removeChild(game.assets['unmuted']);
			toggleMuteButton.appendChild(game.assets['muted']);
			gameMusic.stopAll();
			menuMusic.stopAll();
		}
	};

	function playMenuMove() {
		if (!game.muted) {
			menuMoveSound.play();
		}

	}

	engine.screenManager.registerScreen('homeScreen',
		function initialize() {
			console.log('initializing homeScreen...');

			let homeToEnterNameButton = document.getElementById('homeToEnterNameButton');
			let homeToControlsButton = document.getElementById('homeToControlsButton');
			let homeToHighScoresButton = document.getElementById('homeToHighScoresButton');
			let homeToCreditsButton = document.getElementById('homeToCreditsButton');

			homeToEnterNameButton.onclick = function() {
				engine.screenManager.changeScreen('enterNameScreen');
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			homeToControlsButton.onclick = function() {
				engine.screenManager.changeScreen('controlsScreen');
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			homeToHighScoresButton.onclick = function() {
				engine.screenManager.changeScreen('highScoresScreen');
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			homeToCreditsButton.onclick = function() {
				engine.screenManager.changeScreen('creditsScreen');
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			homeToEnterNameButton.onmouseover = playMenuMove;
			homeToControlsButton.onmouseover = playMenuMove;
			homeToHighScoresButton.onmouseover = playMenuMove;
			homeToCreditsButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running homeScreen...');
		}
	);

	engine.screenManager.registerScreen('enterNameScreen',
		function initialize() {
			console.log('initializing enterNameScreen...');
			let nameField = document.getElementById('nameField');

			enterNameToGameButton = document.getElementById('enterNameToGameButton');
			enterNameToHomeButton = document.getElementById('enterNameToHomeButton');

			enterNameToGameButton.onclick = function() {
				engine.network.socket.emit('join', {
					name: nameField.value
				});
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			enterNameToHomeButton.onclick = function() {
				engine.screenManager.changeScreen('homeScreen');
				if (!game.muted) {
					menuBackSound.play();
				}
			};

			enterNameToGameButton.onmouseover = playMenuMove;
			enterNameToHomeButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running enterNameScreen...');
		}
	);

	engine.screenManager.registerScreen('gameScreen',
		function initialize() {
			console.log('initializing gameScreen...');

			gameToHomeButton = document.getElementById('gameToHomeButton');

			gameToHomeButton.onclick = function() {
				engine.network.socket.emit('leave', {});
				gameMusic.stopAll();
				if (!game.muted) {
					menuMusic.play();
				}
			};

			gameToHomeButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running gameScreen...');
			if (!game.muted) {
				gameMusic.play();
			}
			menuMusic.stopAll();
		}
	);

	engine.screenManager.registerScreen('controlsScreen',
		function initialize() {
			console.log('initializing controlsScreen...');

			let controlsToHomeButton = document.getElementById('controlsToHomeButton');

			controlsToHomeButton.onclick = function() {
				engine.screenManager.changeScreen('homeScreen');
				if (!game.muted) {
					menuBackSound.play();
				}
			};

			controlsToHomeButton.onmouseover = playMenuMove;

			let changeThrustButton = document.getElementById('changeThrustButton');
			let changeRotateLeftButton = document.getElementById('changeRotateLeftButton');
			let changeRotateRightButton = document.getElementById('changeRotateRightButton');
			let changeShootButton = document.getElementById('changeShootButton');

			changeThrustButton.innerHTML = game.controls.thrust === ' ' ? 'Space' : game.controls.thrust;
			changeRotateLeftButton.innerHTML = game.controls.rotateLeft === ' ' ? 'Space' : game.controls.rotateLeft;
			changeRotateRightButton.innerHTML = game.controls.rotateRight === ' ' ? 'Space' : game.controls.rotateRight;
			changeShootButton.innerHTML = game.controls.shoot === ' ' ? 'Space' : game.controls.shoot;

			let selectedButton = null;

			function assignKey(e) {
				if (selectedButton === changeThrustButton) {
					engine.inputManager.keyboard.unregister(game.controls.thrust);
					game.controls.thrust = e.key;
					engine.inputManager.keyboard.registerContinuous(game.controls.thrust, game.model.emitThrust);
				}
				if (selectedButton === changeRotateLeftButton) {
					engine.inputManager.keyboard.unregister(game.controls.rotateLeft);
					game.controls.rotateLeft = e.key;
					engine.inputManager.keyboard.registerContinuous(game.controls.rotateLeft, game.model.emitRotateLeft);
				}
				if (selectedButton === changeRotateRightButton) {
					engine.inputManager.keyboard.unregister(game.controls.rotateRight);
					game.controls.rotateRight = e.key;
					engine.inputManager.keyboard.registerContinuous(game.controls.rotateRight, game.model.emitRotateRight);
				}
				if (selectedButton === changeShootButton) {
					engine.inputManager.keyboard.unregister(game.controls.shoot);
					game.controls.shoot = e.key;
					engine.inputManager.keyboard.registerContinuous(game.controls.shoot, game.model.emitShoot);
				}

				selectedButton.innerHTML = e.key === ' ' ? 'Space' : e.key;
				engine.storage.save('controls', game.controls);

				changeThrustButton.disabled = false;
				changeRotateLeftButton.disabled = false;
				changeRotateRightButton.disabled = false;
				changeShootButton.disabled = false;
				window.removeEventListener('keydown', assignKey);
			}

			function awaitInput() {
				selectedButton.blur();
				selectedButton.innerHTML = 'Press any key';
				if (selectedButton !== changeThrustButton) {
					changeThrustButton.disabled = true;
				}
				if (selectedButton !== changeRotateLeftButton) {
					changeRotateLeftButton.disabled = true;
				}
				if (selectedButton !== changeRotateRightButton) {
					changeRotateRightButton.disabled = true;
				}
				if (selectedButton !== changeShootButton) {
					changeShootButton.disabled = true;
				}
				window.addEventListener('keydown', assignKey);

			}

			changeThrustButton.onclick = () => {
				selectedButton = changeThrustButton;
				awaitInput();
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			changeRotateLeftButton.onclick = () => {
				selectedButton = changeRotateLeftButton;
				awaitInput();
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			changeRotateRightButton.onclick = () => {
				selectedButton = changeRotateRightButton;
				awaitInput();
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			changeShootButton.onclick = () => {
				selectedButton = changeShootButton;
				awaitInput();
				if (!game.muted) {
					menuClickSound.play();
				}
			};

			changeThrustButton.onmouseover = playMenuMove;
			changeRotateLeftButton.onmouseover = playMenuMove;
			changeRotateRightButton.onmouseover = playMenuMove;
			changeShootButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running controlsScreen...');
		}
	);

	engine.screenManager.registerScreen('highScoresScreen',
		function initialize() {
			console.log('initializing highScoresScreen...');

			let highScoresToHomeButton = document.getElementById('highScoresToHomeButton');

			highScoresToHomeButton.onclick = function() {
				engine.screenManager.changeScreen('homeScreen');
				if (!game.muted) {
					menuBackSound.play();
				}
			};

			highScoresToHomeButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running highScoresScreen...');
			engine.network.socket.emit('get-high-scores', {});
		}
	);

	engine.network.socket.on('high-scores', function(data) {
		let html = '<tr><th>Name</th><th>Score</th></tr>';
		for (let i = 0; i < data.maxHighScores; i++) {
			if (i < data.highScores.length) {
				html += '<tr><td>' + data.highScores[i].name + '</td><td>' + data.highScores[i].score + '</td></tr>';
			} else {
				html += '<tr><td>-</td><td>-</td></tr>';
			}
		}

		document.getElementById('highScoresTable').innerHTML = html;
	});

	engine.screenManager.registerScreen('creditsScreen',
		function initialize() {
			console.log('initializing creditsScreen...');

			let creditsToHomeButton = document.getElementById('creditsToHomeButton');

			creditsToHomeButton.onclick = function() {
				engine.screenManager.changeScreen('homeScreen');
				if (!game.muted) {
					menuBackSound.play();
				}
			};

			creditsToHomeButton.onmouseover = playMenuMove;
		},
		function run() {
			console.log('running creditsScreen...');
		}
	);

	engine.screenManager.initializeScreens();

})();