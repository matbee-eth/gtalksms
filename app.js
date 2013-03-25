
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , xmpp = require('node-xmpp')
  , sys = require('sys')
  , tropo = require('tropo-webapi')
  , tropoSession = require('./node_modules/tropo-webapi/lib/tropo-session.js');
// Enter your tropo outbound messaging token below.
var token = '017cb4ad1de1fb4da5ea41f13da12b8be6bc12afc8139749e192e0e14cd6d6ccb744009260946251330a6914';
// The message you want to send.
var msg = encodeURI('This is a test SMS message from Node.js. Tropo - FTW!');
// The number you want to send the SMS message to.
var number = '16472029446';

var session = new tropoSession.TropoSession();

// Invoke the makeApiCall() method and pass in token, message to send and number to send to.
session.makeApiCall(token, {msg: msg, number: number, usingNumber: "2898040379"});

// Write out put to console.
session.addListener('responseBody', function(response) {
  console.log(response);
});

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

app.post('/inbound', function (req, res) {
  console.log(req.body);
  res.contentType('application/json');
  var callerID = null;
  var message = null;
  var intendedNumber = null;
  var create = false;

  if (req.body.session) {
    var info = req.body.session;
    if (info.parameters && info.parameters.action && info.parameters.action == "create") {
      create = true;
      var webapi = new tropo.TropoWebAPI();
      console.log('INBOUND TROPO MESSAGE: ');
      var sss = {value: info.parameters.msg}
      webapi.message(sss, info.parameters.number, false, "TEXT", info.parameters.usingNumber);
      res.send(TropoJSON(webapi));
    }
    else {
      callerID = info.from.id;
      message = info.initialText;
      intendedNumber = info.to.id;
      reply_id = callerID;
    }

  }
  else {
    callerID = req.body['inboundSMSMessageNotification']['inboundSMSMessage']['senderAddress'];
    message = req.body['inboundSMSMessageNotification']['inboundSMSMessage']['message'];
    intendedNumber = req.body['inboundSMSMessageNotification']['inboundSMSMessage']['destinationAddress'];
    intendedNumber = intendedNumber.substr(6);
    reply_id = callerID.substr(5);
  }

  if (!create) {
    var complete_msg = "Caller: " + reply_id + " -- Msg: " + message;
    console.log(complete_msg);
    res.end();
  }
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

