let game = {
    name: 'Asteroidz',
    assets: {},
    sprites: {},
    particles: {},
    model: {},
    muted: true
};

//------------------------------------------------------------------
//
// Purpose of this code is to bootstrap (maybe I should use that as the name)
// the rest of the application.  Only this file is specified in the index.html
// file, then the code in this file gets all the other code and assets
// loaded.
//
//------------------------------------------------------------------
(function() {
    'use strict';
    let scriptOrder = [
        {
            scripts: ['engine/engine'],
            message: 'Engine loaded',
            onComplete: null
        }, {
            scripts: ['engine/random'],
            message: 'Random loaded',
            onComplete: null
        }, {
            scripts: ['engine/network'],
            message: 'Network loaded',
            onComplete: null
        }, {
            scripts: ['engine/graphics'],
            message: 'Graphics loaded',
            onComplete: null
        }, {
            scripts: ['engine/storage'],
            message: 'Storage loaded',
            onComplete: null
        }, {
            scripts: ['engine/audioManager'],
            message: 'Audio manager loaded',
            onComplete: null
        }, {
            scripts: ['engine/inputManager'],
            message: 'Input manager loaded',
            onComplete: null
        }, {
            scripts: ['engine/particleManager'],
            message: 'Particle manager loaded',
            onComplete: null
        }, {
            scripts: ['engine/screenManager'],
            message: 'Screen manager loaded',
            onComplete: null
        }, {
            scripts: ['engine/gameLoop'],
            message: 'Game loop loaded',
            onComplete: null
        }, {
            scripts: ['game/sprites'],
            message: 'Sprites loaded',
            onComplete: null
        }, {
            scripts: ['game/background'],
            message: 'Background loaded',
            onComplete: null
        }, {
            scripts: ['game/camera'],
            message: 'Camera loaded',
            onComplete: null
        }, {
            scripts: ['game/particles'],
            message: 'Particles loaded',
            onComplete: null
        }, {
            scripts: ['game/player'],
            message: 'Player loaded',
            onComplete: null
        }, {
            scripts: ['game/model'],
            message: 'Gameplay model loaded',
            onComplete: null
        }, {
            scripts: ['game/screens'],
            message: 'Screens loaded',
            onComplete: null
        }];

    let assetOrder = [{
            key: 'asteroid-sprites',
            source: 'assets/images/asteroidSprites.png'
        }, {
            key: 'beams',
            source: 'assets/images/beams.png'
        }, {
            key: 'explosion-sprites',
            source: 'assets/images/explosionSprites.png'
        }, {
            key: 'player',
            source: 'assets/images/spiked ship 3. small.blue_.png'
        }, {
            key: 'ufo',
            source: 'assets/images/ufo.png'
        }, {
            key: 'tile-0-0',
            source: 'assets/images/tile_0_0.jpg'
        }, {
            key: 'tile-0-1',
            source: 'assets/images/tile_0_1.jpg'
        }, {
            key: 'tile-0-2',
            source: 'assets/images/tile_0_2.jpg'
        }, {
            key: 'tile-0-3',
            source: 'assets/images/tile_0_3.jpg'
        }, {
            key: 'tile-0-4',
            source: 'assets/images/tile_0_4.jpg'
        }, {
            key: 'tile-0-5',
            source: 'assets/images/tile_0_5.jpg'
        }, {
            key: 'tile-0-6',
            source: 'assets/images/tile_0_6.jpg'
        }, {
            key: 'tile-1-0',
            source: 'assets/images/tile_1_0.jpg'
        }, {
            key: 'tile-1-1',
            source: 'assets/images/tile_1_1.jpg'
        }, {
            key: 'tile-1-2',
            source: 'assets/images/tile_1_2.jpg'
        }, {
            key: 'tile-1-3',
            source: 'assets/images/tile_1_3.jpg'
        }, {
            key: 'tile-1-4',
            source: 'assets/images/tile_1_4.jpg'
        }, {
            key: 'tile-1-5',
            source: 'assets/images/tile_1_5.jpg'
        }, {
            key: 'tile-1-6',
            source: 'assets/images/tile_1_6.jpg'
        }, {
            key: 'tile-2-0',
            source: 'assets/images/tile_2_0.jpg'
        }, {
            key: 'tile-2-1',
            source: 'assets/images/tile_2_1.jpg'
        }, {
            key: 'tile-2-2',
            source: 'assets/images/tile_2_2.jpg'
        }, {
            key: 'tile-2-3',
            source: 'assets/images/tile_2_3.jpg'
        }, {
            key: 'tile-2-4',
            source: 'assets/images/tile_2_4.jpg'
        }, {
            key: 'tile-2-5',
            source: 'assets/images/tile_2_5.jpg'
        }, {
            key: 'tile-2-6',
            source: 'assets/images/tile_2_6.jpg'
        }, {
            key: 'tile-3-0',
            source: 'assets/images/tile_3_0.jpg'
        }, {
            key: 'tile-3-1',
            source: 'assets/images/tile_3_1.jpg'
        }, {
            key: 'tile-3-2',
            source: 'assets/images/tile_3_2.jpg'
        }, {
            key: 'tile-3-3',
            source: 'assets/images/tile_3_3.jpg'
        }, {
            key: 'tile-3-4',
            source: 'assets/images/tile_3_4.jpg'
        }, {
            key: 'tile-3-5',
            source: 'assets/images/tile_3_5.jpg'
        }, {
            key: 'tile-3-6',
            source: 'assets/images/tile_3_6.jpg'
        }, {
            key: 'tile-4-0',
            source: 'assets/images/tile_4_0.jpg'
        }, {
            key: 'tile-4-1',
            source: 'assets/images/tile_4_1.jpg'
        }, {
            key: 'tile-4-2',
            source: 'assets/images/tile_4_2.jpg'
        }, {
            key: 'tile-4-3',
            source: 'assets/images/tile_4_3.jpg'
        }, {
            key: 'tile-4-4',
            source: 'assets/images/tile_4_4.jpg'
        }, {
            key: 'tile-4-5',
            source: 'assets/images/tile_4_5.jpg'
        }, {
            key: 'tile-4-6',
            source: 'assets/images/tile_4_6.jpg'
        }, {
            key: 'muted',
            source: 'assets/images/muted.png'
        }, {
            key: 'unmuted',
            source: 'assets/images/unmuted.png'
        }, {
            key: 'game-music',
            source: 'assets/audio/468407__onderwish__sci-fi-survival-dreamscape.mp3'
        }, {
            key: 'menu-music',
            source: 'assets/audio/344881__levelclearer__solar939.mp3'
        }, {
            key: 'ship-explosion',
            source: 'assets/audio/33245__ljudman__grenade.mp3'
        }, {
            key: 'player-laser-sound',
            source: 'assets/audio/42106__marcuslee__laser-wrath-4.mp3'
        }, {
            key: 'ufo-laser-sound',
            source: 'assets/audio/18382__inferno__hvylas.mp3'
        }, {
            key: 'asteroid-explosion',
            source: 'assets/audio/155235__zangrutz__bomb-small.mp3'
        }, {
            key: 'ufo-spawn',
            source: 'assets/audio/145445__soughtaftersounds__menu-sound-fat.mp3'
        }, {
            key: 'menu-move',
            source: 'assets/audio/397599__nightflame__menu-fx-02.mp3'
        }, {
            key: 'menu-click',
            source: 'assets/audio/403007__inspectorj__ui-confirmation-alert-a2.mp3'
        }, {
            key: 'menu-back',
            source: 'assets/audio/50557_broumbroum_sf3-sfx-menu-back.mp3'
        }];

    //------------------------------------------------------------------
    //
    // Helper function used to load scripts in the order specified by the
    // 'scripts' parameter.  'scripts' expects an array of objects with
    // the following format...
    //    {
    //        scripts: [script1, script2, ...],
    //        message: 'Console message displayed after loading is complete',
    //        onComplete: function to call when loading is complete, may be null
    //    }
    //
    //------------------------------------------------------------------
    function loadScripts(scripts, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                scripts.splice(0, 1);
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'assets/url/asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    function loadAssets(assets, onSuccess, onError, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            let entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // This function is used to asynchronously load image and audio assets.
    // On success the asset is provided through the onSuccess callback.
    // Reference: http://www.html5rocks.com/en/tutorials/file/xhr2/
    //
    //------------------------------------------------------------------
    function loadAsset(source, onSuccess, onError) {
    	let xhr = new XMLHttpRequest(),
            asset = null,
            fileExtension = source.substr(source.lastIndexOf('.') + 1);    // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    //------------------------------------------------------------------
    //
    // Called when all the scripts are loaded, it kicks off the demo app.
    //
    //------------------------------------------------------------------
    function mainComplete() {
        console.log('it is all loaded up');
    }

    //
    // Start with loading the assets, then the scripts.
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {    // Store it on success
            game.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());