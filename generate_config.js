var async = require('async'),
	fs = require('fs');

var ask = function(question, format, callback) {
 var stdin = process.stdin, stdout = process.stdout;

 stdin.resume();
 stdout.write(question + ": ");

 stdin.once('data', function(data) {
   data = data.toString().trim();

   if (format.test(data)) {
     callback(data);
   } else {
     stdout.write("It should match: "+ format +"\n");
     ask(question, format, callback);
   }
 });
};

var configData = {};


async.waterfall([
	function(cb) {
		ask('Listen on port?', /.+/, function(port) {
			configData.port = port;
			cb();
		});
	}, function(cb) {
		ask('Nexmo Number?', /.+/, function(nexmoNumber) {
			configData.nexmoNumber = nexmoNumber;
			cb();
		});
	}, function(cb) {
		ask('Nexmo API Key?', /.+/, function(nexmoApiKey) {
			configData.nexmoApiKey = nexmoApiKey;
			cb();
		});
	}, function(cb) {
		ask('Nexmo Secret?', /.+/, function(nexmoSecret) {
			configData.nexmoSecret = nexmoSecret;
			cb();
		});
	}, function(cb) {
		ask('Number of transports?', /.+/, function(num) {
			var iterate = new Array(parseInt(num, 10));
			configData.transports = [];
			async.eachSeries(iterate, function(useless, next) {
				var transport = {};
				configData.transports.push(transport);
				async.waterfall([
					function(nextQuestion) {
						ask('Your phone number? (No spaces or special characters)', /.+/, function(number) {
							transport.number = number;
							nextQuestion();
						});
					}, function(nextQuestion) {
						ask('Your Google Talk Account?', /.+/, function(email) {
							transport.email = email;
							nextQuestion();
						});
					}, function(nextQuestion) {
						ask('Your Google Talk Password?', /.+/, function(password) {
							transport.password = password;
							nextQuestion();
						});
					}, function(nextQuestion) {
						ask('Who to respond to? (Gtalk Address)', /.+/, function(gtalk) {
							transport.gtalk = gtalk;
							nextQuestion();
						});
					}
				], function(err) {
					console.log('herrooooo?');
					next();
				});


			}, function() {
				console.log('ummmm');
				cb();
			});
		});
	}
], function(err) {

	fs.writeFile('config.js', '// GTalk SMS Config\n', function(err) {
		if (!err) {
			console.log(configData);
			for(var key in configData) {
				fs.appendFileSync(
					'config.js',
					'exports.' + key + '=' + JSON.stringify(configData[key]) + ';\n'
				);
			}

			process.exit();

		} else {
			console.log('OH NO! Something happened when saving the file.');
		}
	});

});

