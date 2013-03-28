/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  xmpp = require('simple-xmpp'),
  sys = require('sys'),
  config = require('./config'),
  async = require('async');


// Reserved vars
var connections = [];

var app = express();

app.configure(function(){
  app.set('port', config.port || 8999);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

async.each(config.transports, function(transport, cb) {
  // Connect GTalk
  var gtalk = new xmpp.SimpleXMPP();

  gtalk.on('online', function() { console.log('Gtalk connected'); });
  gtalk.on('error', function(err) { console.error('Gtalk error', err); });

  gtalk.on('chat', function(from, message) {
    if (from === transport.gtalk) {
      console.log('SENDING', message, 'TO', transport.number, 'FROM', config.nexmoNumber);
      nexmo.sendTextMessage(config.nexmoNumber, transport.number, message, function () {
        console.log(arguments);
      });
    }
  });

  gtalk.connect({
    jid         : transport.email,
    password    : transport.password,
    host        : 'talk.google.com',
    port        : 5222
  });

  // check for incoming subscription requests
  gtalk.getRoster();

  transport.xmpp = gtalk;

  /*gtalk.on('subscribe', function(from) {
    if (from === 'mathieu.gosbee@matbee.com') {
      gtalk.acceptSubscription(from);
    }
    xmpp.subscribe('mathieu.gosbee@matbee.com');
  });*/

});


/*
* SMS
*/
var nexmo = require('./node_modules/easynexmo/lib/nexmo');

nexmo.initialize(config.nexmoApiKey, config.nexmoNumber);

app.all('/message', function (req, res) {
  console.log("/message", req.query, req.params, req.body);

  async.each(config.transports, function(transport, cb) {
    if (req.query.msisdn == transport.number) {
      transport.xmpp.send(transport.gtalk, req.query.text);
    }
  }, function() {
    res.end();
  });

});

app.all('/delivery', function (req, res) {
  console.log("/delivery", req.query, req.params, req.body);
  res.end();
});