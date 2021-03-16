(function() {

	engine.network.socket = io();

	engine.network.socket.on('connect-ack', function(data) {
		console.log('Connection established');
	});

})();