(function() {
	'use strict';
	var dgram = require('dgram');
	var Metrics = function(config) {
		this.config = config;
		this.socket = dgram.createSocket('udp4');

	};

	Metrics.prototype.send = function(data) {
		var session = 'http.' + data.session + '.virtualhost.' + data.frontend.split('.').join('_');
		var metrics = [];
		if (data.totalTimeSpent) {

			metrics.push(session + '.time:' + data.totalTimeSpent + '|ms');
			metrics.push(session + '.router.time:' + data.totalTimeSpent + '|ms');

			metrics.push(session + '.count:1|c');
			metrics.push(session + '.router.count:1|c');

		}

		metrics.push(session + '.bytesWritten:' + data.bytesWritten + '|c');
		metrics.push(session + '.router.bytesWritten:' + data.bytesWritten + '|c');

		metrics.push(session + '.bytesRead:' + data.bytesRead + '|c');
		metrics.push(session + '.router.bytesRead:' + data.bytesRead + '|c');

		metrics.push(session + '.bytesTotal:' + data.bytesRead + data.bytesWritten + '|c');
		metrics.push(session + '.router.bytesTotal:' + data.bytesRead + data.bytesWritten + '|c');
		var buf = new Buffer(metrics.join('\n'));
		this.socket.send(buf, 0, buf.length, this.config.port, this.config.host);

	};

	Metrics.prototype._send = function(stat, value, type) {
		var buf = new Buffer(stat + ':' + value + '|' + type);
		this.socket.send(buf, 0, buf.length, this.config.port, this.config.host);
	};

	module.exports = Metrics;

})();
