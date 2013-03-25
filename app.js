
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
app.all('/message', function (req, res) {
  console.log("/message", req.query, req.params, req.body);
  res.end();
});
app.all('/delivery', function (req, res) {
  console.log("/delivery", req.query, req.params, req.body);
  res.end();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*
* XMPP shit
*/
var conn = new xmpp.Client({
    jid         : "mathieu.gosbee@matbee.com",
    password    : "1namirhA",
    host        : 'talk.google.com',
    port        : 5222
});

conn.on('online', function(){
    console.log('online');
    conn.send(new xmpp.Element('presence'));
    // conn.send(new xmpp.Element('message',
    //     { to: "mathieu.gosbee@matbee.com", // to
    //         type: 'chat'}).
    //         c('body').
    //         t('test'));
});

conn.on('error', function(e) {
    console.log(e);
});

conn.addListener('stanza', function (stanza) {
  if('error' === stanza.attrs.type) {
    console.log('[error] ' + stanza.toString());
  } else if(stanza.is('message')) {
    console.log(stanza.attrs);
  }
});

/*
* SMS
*/
var nexmo = require('./node_modules/easynexmo/lib/nexmo');

nexmo.initialize("0f72fcfb","ab10fa19");
nexmo.sendTextMessage("12898471009","16472029446",'testing',function () {
  console.log(arguments);
});