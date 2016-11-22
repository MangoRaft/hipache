(function() {
	'use strict';

	var Metrics = function(config) {
		this.config = config;
		this.socket = dgram.createSocket('udp4');

	};

	Metrics.prototype.send = function(data) {
		var session = 'http.' + data.session + '.virtualhost.' + data.frontend.split('.').join('_');

		if (data.totalTimeSpent) {
			this._send(session + '.time', data.totalTimeSpent, 'ms');
			this._send(session + '.router.time', data.totalTimeSpent, 'ms');

			this._send(session + '.count', 1, 'c');
			this._send(this.config.session + '.router.count', 1, 'c');

		}

		this._send(session + '.bytesWritten', data.bytesWritten, 'c');
		this._send(this.config.session + '.router.bytesWritten', data.bytesWritten, 'c');

		this._send(session + '.bytesRead', data.bytesRead, 'c');
		this._send(this.config.session + '.router.bytesRead', data.bytesRead, 'c');

		this._send(session + '.bytesTotal', data.bytesRead + data.bytesWritten, 'c');
		this._send(this.config.session + '.router.bytesTotal', data.bytesRead + data.bytesWritten, 'c');

	};

	Metrics.prototype._send = function(stat, value, type) {
		var buf = new Buffer(stat + ':' + value + '|' + type);
		this.socket.send(buf, 0, buf.length, this.config.port, this.config.host, callback);
	};

	module.exports = Metrics;

})();
