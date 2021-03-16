engine.audioManager.getMultiChannel = function(audio, numChannels=1, loop=false) {
	let channels = [];

	let nextChannel = 0;
	let oldestChannel = 0;

	for (let i = 0; i < numChannels; i++) {
		// channels.push(new Audio());
		if (i === 0) {
			channels.push(audio);
		} else {
			channels.push(channels[0].cloneNode());
		}
		// channels[i].isReady = false;

		// channels[i].addEventListener('canplay', function() {
		// 	channels[i].isReady = true;
		// });

		if (loop) {
			// Add looping to make a continuous sound.
			// Use a buffer to create an audio loop with no gap.
			// src: https://stackoverflow.com/questions/7330023/gapless-looping-audio-html5
			channels[i].addEventListener('timeupdate', function() {
				var buffer = 0.3;
			    if (channels[i].currentTime > channels[i].duration - buffer){
			        channels[i].currentTime = 0;
			    }
			});
		}

		channels[i].addEventListener('ended', function() {
			oldestChannel += 1;
			oldestChannel %= numChannels;
			// console.log('oldestChannel: ', oldestChannel);
		});

	}

	let sound = {};

	// Oldest channel change when paused or overwritten???

	sound.play = function() {
		// if (channels[nextChannel].isReady) {
			channels[nextChannel].currentTime = 0;
			channels[nextChannel].play();
			nextChannel += 1;
			nextChannel %= numChannels;
			// console.log('nextChannel: ', nextChannel);
		// }
	};

	sound.stopAll = function() {
		for (let i = 0; i < numChannels; i++) {
			channels[i].pause();
		}

		nextChannel = 0;
		oldestChannel = 0;
	};

	sound.setVolume = function(volume) {
		for (let i = 0; i < numChannels; i++) {
			channels[i].volume = volume;
		}
	};

	return sound;
};

// engine.audioManager.registerSound = function(name, source) {
// 	sounds[name] = {};
// 	sounds[name].soundType = soundTypes.SINGLE;
// 	sounds[name].audio = [];
// 	for (let i = 0; i < NUM_CHANNELS; i++) {
// 		sounds[name].audio.push(new Audio());
// 		sounds[name].audio[i].isReady = false;

// 		sounds[name].audio[i].addEventListener('canplay', function() {
// 			sounds[name].audio[i].isReady = true;
// 		});

// 		sounds[name].audio[i].src = source;
// 	}
// };

// engine.audioManager.registerLoopingSound = function(name, source) {
// 	sounds[name] = {};
// 	sounds[name].soundType = soundTypes.LOOP;
// 	sounds[name].audio = [];
// 	for (let i = 0; i < NUM_CHANNELS; i++) {
// 		sounds[name].audio.push(new Audio());
// 		sounds[name].audio[i].isReady = false;

// 		sounds[name].audio[i].addEventListener('canplay', function() {
// 			sounds[name].audio[i].isReady = true;
// 		});

// 		// Add looping to make a continuous sound.
// 		// Use a buffer to create an audio loop with no gap.
// 		// src: https://stackoverflow.com/questions/7330023/gapless-looping-audio-html5
// 		sounds[name].audio[i].addEventListener('timeupdate', function() {
// 			var buffer = 0.5;
// 		    if (this.currentTime > this.duration - buffer){
// 		        this.currentTime = 0;
// 		    }
// 		});

// 		sounds[name].audio[i].src = source;
// 	}
// };

// engine.audioManager.playSound = function(name) {
// 	if (sounds.hasOwnProperty(name)) {
// 		for (let i = 0; i < NUM_CHANNELS; i++) {
// 			if (sounds[name].audio[i].isReady && sounds[name].audio[i].paused) {
// 				sounds[name].audio[i].currentTime = 0;
// 				sounds[name].audio[i].play();
// 				break;
// 			}
// 		}
// 	}
// }

// engine.audioManager.pauseSingleSound = function(name) {
// 	if (sounds.hasOwnProperty(name)) {
// 		for (let i = NUM_CHANNELS - 1; i >= 0; i--) {
// 			if (!sounds[name].audio[i].paused) {
// 				sounds[name].audio[i].pause();
// 				break;
// 			}
// 		}
// 	}
// };

// engine.audioManager.pauseAllSound = function(name) {
// 	if (sounds.hasOwnProperty(name)) {
// 		for (let i = NUM_CHANNELS - 1; i >= 0; i--) {
// 			if (!sounds[name].audio[i].paused) {
// 				sounds[name].audio[i].pause();
// 			}
// 		}
// 	}
// };