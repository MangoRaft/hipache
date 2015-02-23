(function() {
	'use strict';

	var fs = require('fs'),
	    util = require('util'),
	    EventEmitter = require('events').EventEmitter;
	var StatsD = require('node-statsd');

	var Metrics = function(config) {

		var client = new StatsD(config);
		this.send = function(data) {
			var metric = [];

			var session = data.session + '.virtualhost.' + data.frontend;
			
			client.timing([session + '.time', config.session + '.router.time'], data.totalTimeSpent);
			client.increment([session + '.count', config.session + '.router.count']);
			client.increment([session + '.bytesWritten', config.session + '.router.bytesWritten'], data.bytesWritten);
			client.increment([session + '.bytesRead', config.session + '.router.bytesRead'], data.bytesRead);
			client.increment([session + '.bytesTotal', config.session + '.router.bytesTotal'], data.bytesRead + data.bytesWritten);

		};
	};

	util.inherits(Metrics, EventEmitter);

	module.exports = Metrics;

})();
