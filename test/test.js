// create connection (you can use it in whole project, but store in file and export)
var redisEventEmitter = require('../index.js')({
    host: 'redishost.com'
});

process.stdin.setEncoding('utf8');

// Input data and press enter
process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		// On enter emit the message and the function
		// to execute on another instance of this test program
		redisEventEmitter.emit('mess', chunk, function(arg) {
			console.log("Display: " + arg);
		});
	}
});

process.stdin.on('end', function() {
  process.stdout.write('end');
});

redisEventEmitter.on('mess', function(message, callback) {
	// call function sent fron far server using current scope
	callback(message);
});
