
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , xmpp = require('node-xmpp')
  , sys = require('sys');


// Reserved vars
var connections = [];

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8999);
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

/*
* XMPP shit
*/
var xmpp = require('simple-xmpp');

xmpp.on('online', function() {
    console.log('Yes, I\'m connected!');
});

xmpp.on('chat', function(from, message) {
  console.log(arguments);
  if (from === "mathieu.gosbee@matbee.com") {
    nexmo.sendTextMessage("12898471009","16472029446",'Is this working?',function () {
      console.log(arguments);
    });
  }
});

xmpp.on('error', function(err) {
    console.error(err);
});

xmpp.on('subscribe', function(from) {
  console.log(arguments);
  if (from === 'mathieu.gosbee@matbee.com') {
    xmpp.acceptSubscription(from);
  }
});

var config = {
  jid         : "mariam.ayoub@matbee.com",
  password    : "mariam.ayoub",
  host        : 'talk.google.com',
  port        : 5222
}

xmpp.connect(config);

xmpp.subscribe('mathieu.gosbee@matbee.com');
// check for incoming subscription requests
xmpp.getRoster();

/*
* SMS
*/
var nexmo = require('./node_modules/easynexmo/lib/nexmo');

nexmo.initialize("0f72fcfb","ab10fa19");

app.all('/message', function (req, res) {
  console.log("/message", req.query, req.params, req.body);
  if (req.query.msisdn == '16472029446') {
    xmpp.send("mathieu.gosbee@matbee.com", req.query.text);
  }
  res.end();
});

app.all('/delivery', function (req, res) {
  console.log("/delivery", req.query, req.params, req.body);
  res.end();
});