var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.createConnection();
var config = config || {};
var dbHost = config.MONGO_LOCATION || "localhost";

var timer;
db.on('error', function () {
	console.error('conn error', arguments);
	clearTimeout(timer);
	timer = setTimeout(connect, sleep);
	if (db.db && db.db.close) {
		db.db.close();
	}
});

db.on('open', function () {
	console.error('DB Opened.');
	clearTimeout(timer);
});

db.on('disconnected', function () {
	console.log("disconnected.", arguments);
  	clearTimeout(timer);
	timer = setTimeout(connect, sleep);
	if (db.db && db.db.close) {
		db.db.close();
	}
});

var connect = function () {
	console.log("db.connect!", dbHost.split(","));
	if (dbHost.split(",").length > 1) {
		// Multiple dbHosts.
		db.openSet("mongodb://" + dbHost.split(",").join(",mongodb://"), { replset: { strategy: 'ping', rs_name: 'rs0' }, server: { auto_reconnect: true }});
	} else {
		// Single dbhost YAY!
		db.open(dbHost, "gtalksms-stable", 27017, {server: { auto_reconnect: true }});
	}
};
// connect.time = 0;
connect();

exports.UserNumberCombo