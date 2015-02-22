(function() {
	'use strict';

	var fs = require('fs'),
	    util = require('util'),
	    EventEmitter = require('events').EventEmitter;

	var Logger = require('raft-logger-redis').Logger;

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	var addDigit = function(n) {
		if (n < 10) {
			return '0' + n;
		}
		return n;
	};

	var AccessLogger = function(config) {

		var logger = Logger.createLogger(config);

		var logs = {};

		var stream;

		var sayErr = ( function(e) {
				process.nextTick( function() {
					this.emit('error', e);
				}.bind(this));
			}.bind(this));

		var start = this.start = function() {
			stream = logger.create({
				source : 'router',
				channel : 'router.1',
				session : config.session
			});
		};

		var stop = this.stop = function() {
			stream.stop();
		};

		process.on('SIGUSR1', function() {
			// Reload the Stream on signal
			util.log('Caught a SIGUSR1 signal, reopening the log file.');
			stop();
			start();
		});

		try {
			start();
		} catch (e) {
			sayErr(e);
		}

		this._log = function(data) {
			stream.log(data);
		};

		this.log = function(data) {
			var line = '',
			    date = new Date(data.currentTime);
			// Remote addr
			if (!data.remoteAddr || data.remoteAddr.slice(0, 2) !== '::') {
				line += '::ffff:';
			}
			line += data.remoteAddr;
			// Empty
			line += ' - - ';
			// Date
			line += '[';
			line += addDigit(date.getUTCDate());
			line += '/';
			line += months[date.getUTCMonth()];
			line += '/';
			line += date.getFullYear();
			line += ':';
			line += addDigit(date.getUTCHours());
			line += ':';
			line += addDigit(date.getUTCMinutes());
			line += ':';
			line += addDigit(date.getUTCSeconds());
			line += ' +0000] "';
			// Request
			line += data.method;
			line += ' ';
			line += data.url;
			line += ' HTTP/';
			line += data.httpVersion;
			line += '" ';
			// Status code
			line += data.statusCode;
			line += ' ';
			// Bytes sent
			//FIXME, sometimes we cannot read socketBytesWritten (maybe because of a websocket?)
			line += data.socketBytesWritten || 0;
			line += ' "';
			// Referer
			line += data.referer || '';
			line += '" "';
			// User-Agent
			line += data.userAgent || '';
			line += '" "';
			// Virtual host
			line += data.virtualHost;
			line += '" ';
			// Total time spent
			line += (data.totalTimeSpent / 1000);
			line += ' ';
			// Backend time spent
			line += (data.backendTimeSpent / 1000);
			stream.write(line + '\n');
			if (data.session) {

				var name = data.virtualHost + '.' + data.backendId;

				if (!logs[name]) {
					logs[name] = logger.create({
						source : 'system',
						channel : 'router',
						session : data.session
					});
					logs[name].t = 0;
				}

				logs[name].write(line + '\n');

				clearTimeout(logs[name].t);
				logs[name].t = setTimeout(function() {
					delete logs[name];
				}, 15 * 60 * 1000);
			} else {
				stream.write(line + '\n');
			}
		};
	};

	util.inherits(AccessLogger, EventEmitter);

	module.exports = AccessLogger;

})();
