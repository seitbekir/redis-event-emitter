# redis-event-emitter

A simple Redis-based EventEmitter.

Using this module you can emit any type of JS entities as argumets to many servers.
For example you can use in in cluster applications as default event emitter via local redis or replicate your service to many servers and use this emitter as bus.

## Installation

    npm install redis-event-emitter

## Usage

Lets make simple chat in console.
Just start this code from test in two windows and type your message.

```js
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
	// call function sent from far server
	callback(message);
});
```

Also you can emit with local variables
```js
process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		// define val locals to avoid IDE displaying warnings
		var locals = {
			chunk: chunk
		};
		redisEventEmitter
		// apply your local variables before emit
		.apply(locals)
		.emit('mess2', function() {
			// Then use your variables as is on another server.
			// It will replace before sending to emitter
			// Valiable must be called locals. It is reserver word inside module
			console.log("Display: " + locals.chunk);
		});
	}
});

redisEventEmitter.on('mess2', function(callback) {
	// call function sent from far server with special params
	callback();
});
```

## Caveats

When you push an function as argument you should understand that it will execute on another server and will not use current scope, so, don't use local variables to execute.
Also, no sures for now that emit was executed. It realy works like typical push.

For serializing used https://github.com/yahoo/serialize-javascript module

## API

Options:
* host: '127.0.0.1', // Redis server host
* port: 6379, // Redis server port
* prefix: 'redis:emitter', // prefix
* debug: false // console.log some data

Note: When connected to a Redis server, all events are routed through the server which may affect
their latency locally as one would expect.

## TODO

* Promises to make sure that event emited.

## Note on Patches/Pull Requests

* They are very welcome.
* Fork the project.
* Make your feature addition or bug fix, preferably in a branch.
* Send me a pull request.
