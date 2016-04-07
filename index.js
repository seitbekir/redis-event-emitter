var util = require('util');
var EventEmitter = require('events');
var redis = require('redis');
var extend = require('extend');
var serialize = require('serialize-javascript');

var opts = {
	host: '127.0.0.1',
	port: 6379,
	prefix: 'redis:emitter',
	debug: false
}

function objToArray(obj) {
	var result = [];
	for(var i in obj) {
		if (obj.hasOwnProperty(i)) {
			result.push(obj[i]);
		}
	}
	return result;
}


function RedisEventEmitter(_opts) {
	var self = this;
	EventEmitter.call(self);

	self.opts = extend(opts, _opts || {});

	self.pubConnected = false;
	self.subConnected = false;

	function EmitError(error) {
		EventEmitter.prototype.emit.apply(self, ['error', error]);
	}

	process.nextTick( function() {
		self.pub = redis.createClient(opts.port, opts.host, opts.options);
		self.sub = redis.createClient(opts.port, opts.host, opts.options);

		self.pub.on('error', EmitError);
		self.sub.on('error', EmitError);

		self.pub.on('connect', function() {
			self.pubConnected = true;
			EventEmitter.prototype.emit.apply(self, ['connect', 'pub', self.pub]);
			self.opts.debug && console.log('connected');
		});

		self.sub.on('connect', function() {
			self.sub.on( 'subscribe', function(channel, count) {
				self.subConnected = true;
				EventEmitter.prototype.emit.apply(self, ['connect', 'sub', self.sub]);
				self.opts.debug && console.log('subscribed');
			});
			self.sub.subscribe(self.opts.prefix);
		});

		self.sub.on('message', function(channel, args) {
			args = eval("("+ args +")");
			EventEmitter.prototype.emit.apply(self, args);
			self.opts.debug && console.log('message', args);
		});

	});
}

util.inherits(RedisEventEmitter, EventEmitter);

RedisEventEmitter.prototype.emit = function() {
	var self = this;
	var args = objToArray(arguments);

	if (args.length == 0) {
		throw new Error('No arguments');
	}
	if (typeof args[0] != "string") {
		throw new Error('First argument must be string');
	}
	self.opts.debug && console.log('emit', self.pubConnected);
	if (self.pubConnected)
	{
		self.pub.publish( self.opts.prefix, serialize(args));
		return self;
	}
	else
	{
		return EventEmitter.prototype.emit.apply(self, args);
	}
}

module.exports = function(_opts) {
	return new RedisEventEmitter(_opts);
}