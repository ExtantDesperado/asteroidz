engine.random.normalDist = function(mean, stdDev) {
	let u = Math.random();
	let v = Math.random();
	while (u == 0) { u = Math.random(); }			// u and v can't be 0.
	while (v == 0) { v = Math.random(); }
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stdDev + mean;
};