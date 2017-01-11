(function() {
	'use strict';
	var dgram = require('dgram');
	var Metrics = function(config) {
		this.config = config;
		this.socket = dgram.createSocket('udp4');

	};

	Metrics.prototype.send = function(data) {
		var session = 'http.' + data.session + '.' + data.frontend.replace(/\./g, '_');

		var metrics = '';
		if (data.totalTimeSpent) {
			metrics += (session + '.time:' + data.totalTimeSpent + '|ms');
			metrics += (session + '.count:1|c');
		}

		metrics += (session + '.bytesWritten:' + data.bytesWritten + '|c');
		metrics += (session + '.bytesRead:' + data.bytesRead + '|c');
		metrics += (session + '.bytesTotal:' + data.bytesRead + data.bytesWritten + '|c');

		var buf = new Buffer(metrics);
		this.socket.send(buf, 0, buf.length, this.config.port, this.config.host);

	};

	Metrics.prototype._send = function(stat, value, type) {
		var buf = new Buffer(stat + ':' + value + '|' + type);
		this.socket.send(buf, 0, buf.length, this.config.port, this.config.host);
	};

	module.exports = Metrics;

})();
