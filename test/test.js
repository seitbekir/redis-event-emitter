var redisEventEmitter = require('../index.js')({
    host: 'redishost.com'
});

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		redisEventEmitter.emit('mess', chunk, function(arg) {
			console.log("Display: " + arg);
		});
	}
});

process.stdin.on('end', function() {
  process.stdout.write('end');
});

redisEventEmitter.on('mess', function(message, callback) {
	callback(message);
});