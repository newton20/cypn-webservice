var faye;
var opentok = require('opentok');
var http = require('http');
var jiraHost = 'jira.freewebs.com';
var jiraPort = '80';
var jiraAuth = 'os_username=tools&os_password=qwerty7';
// OpenTok Variables
var OPENTOK_API_KEY = '22571042',		// Replace with your API key
	OPENTOK_API_SECRET = '800592e84ac4962efe7feeb791d4fd59beeacf29',		// Replace with your API secret

	// OpenTok SDK
	ot = new opentok.OpenTokSDK(OPENTOK_API_KEY, OPENTOK_API_SECRET),

	// NOTE: Uncomment for production, defaults to "staging.tokbox.com"
	// ot.setEnvironment("api.tokbox.com"),

	// Variables for managing OpenTok Sessions
	MAX_SESSION_CONNECTIONS = 10,	// Maximum number of client connections we want in a given session
 	session_map = {},				// Hash for getting the session of a given client
	ot_sessions = new Array();		// Array for holding all sessions we have generated

var users = {};
var routes = {

	// syncs a single users
	sync: function(info) {
		var currentTime = new Date().getTime();

		// store online users
		if(info.action ==='heartbeat' &&  info.user) {
			info.timestamp = currentTime;
			users[info.user] = info;
		}

		if (info.action === 'removeUser') {
			delete users[info.user];
			faye.publish('/removeUser', key);
		}

		for(var key in users) {
			if (users[key].timestamp+1000 < currentTime) {
				delete users[key];
				faye.publish('/removeUser', key);
			}
		}

		faye.publish('/addUser', info);
	},

	// syncs all users
	fullSync: function() {
		faye.publish('/getAllUsers', users);
	},

	updateChatWindow: function(info) {
		console.log(info);
	},

	//Start a video with the users
	startVideo: function(info) {
		console.log(info);
		if (info.ticket) {
			var key = info.ticket;
		}
		if (key && ot_sessions[key]) {

		}
		else {
			ot.createSession('www.jirachat.com',{},function(session) {
				console.log("session:" +session);
				ot_sessions[key]=session;
			});		
		}
		faye.publish('/showChat', info);
	},

	postChat: function(info) {
		console.log(info);
		if (info.ticket && info.comment) {
			var key = info.ticket;
			var comment = info.comment;
			var body = '{ "body": "' + comment + '" }';
		  console.log(body);
		  var jiraPath = '/rest/api/2/issue/' + key + '/comment?' + jiraAuth;

		  var options = {
		    host: jiraHost,
		    path: jiraPath,
		    port: jiraPort,
		    method: 'POST',
		    headers: {'content-type': 'application/json', 'content-length': Buffer.byteLength(body, 'utf8'),
		    'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.36 Safari/537.22'}
		  };

		  callback = function(response) {
		    var str = ''
		    response.useChunkedEncodingByDefault = false;
		    response.on('data', function (chunk) {
		      str += chunk;
		    });

		    response.on('end', function (e) {
		      console.log("comment created for " + key);
		      console.log(response);
		      console.log(str);
		    });

		  }

		  var req = http.request(options, callback);
		  req.write(body);
		  req.end();
		  console.log(req);
		 }
	}
};

exports.setup = function(app, bayeux){
	faye = bayeux.getClient();
	faye.subscribe('/sync', routes.sync);
	faye.subscribe('/fullSync', routes.fullSync);
	faye.subscribe('/updateChatWindow', routes.updateChatWindow);
	faye.subscribe('/startVideo', routes.startVideo);
	faye.subscribe('/postChat', routes.postChat);

	bayeux.attach(app);
};

