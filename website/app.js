/**
 * Jira Chat Node Server
 * @authors: dpham, swider
 */

//--------------
// Module dependencies
//--------------
var express = require('express')
  , external = require('./routes/external')
//  , user = require('./routes/user')
//  , saveTranscript = require('./routes/saveTranscript')
//  , fayeRoutes = require('./routes/faye')
  , http = require('http')
  , path = require('path')
  , express = require('express')
  , dust = require('express-dust')
//  , faye = require('faye')
  , less = require('less-middleware')

var app = express.createServer();
var ot_sessions = [];
//var bayeux = new faye.NodeAdapter({
//	mount: '/faye',
//	timeout: 45
//});


//--------------
// Config
//--------------

app.configure(function(){
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'cypn', key: 'cypn', cookie: { secure: true}}));
  app.use(app.router);
  app.use(less(__dirname + '/public'));
  // app.use(less({
  //   src: __dirname + '/public',
  //   compress: true
  // }));
  app.use(express.static(__dirname + '/public'));
  app.use(function(req, res){
    res.status(404);
    if (req.accepts('html')) {
      res.render('404', { 'url': req.url });
      return;
    }
    if (req.accepts('json')) {
      res.send({ 'error': 'Not found' });
      return;
    }
    res.type('txt').send('Not found');
  });
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    if (req.accepts('html')) {
      res.render('500', { 'error': err });
      return;
    }
    if (req.accepts('json')) {
      res.send({ 'error': err });
      return;
    }
    res.type('txt').send('500');
  });
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

dust.makeBase({
  system_name: 'CYPN'
});

//--------------------
//schemas and models
//---------------------

//var 
 // mongoStr = "mongodb://localhost/jirachat";
 // db = mongoose.createConnection(mongoStr),
 // Schema = mongoose.Schema;


  //var UserSchema = new Schema({
  //  username: { type: String, required: true, index: {unique: true} },
  //  registered: { type: Date },
  //});
  
 // var User = db.model('User', UserSchema);

  //var ChatSchema = new Schema({
  //  chatid: { type: String, required: true, index: { unique: true } },
 //   created: { type: Date },
  //  content: { type: String },
  //}, {id:false});
  
  //var Doc = db.model('Chat', ChatSchema);

 // var ChatUserLinkSchema = new Schema({
 //   chatid: {type: String},
 //   username: { type: String}
 // });
  
 // var ChatUserLink = db.model('ChatUserLink', ChatUserLinkSchema);


//-------------------
// Routes
//-------------------
/* External */
app.get('/', external.index);
app.get('/screenshots', external.screenshots);
app.get('/follow', external.follow);

/* App */
//app.get('/demo', frame.index);
//app.get('/video', video.index);
//app.get('/video/:id', video.index);

/* API */
//app.get('/users', user.list);
//app.get('/save_transcript', saveTranscript.save);

//fayeRoutes.setup(app, bayeux, ot_sessions);
//video.setup(app, ot_sessions);
//jira.setup({
//  app: app,
//  dbuser: User
//})

//-------------------
// Start Server
//-------------------
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port " + port);
});
