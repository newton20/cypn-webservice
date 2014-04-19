
/*
 * GET main video page.
 */
var opentok = require('opentok');
// OpenTok Variables
var OPENTOK_API_KEY = '22571042',		// Replace with your API key
	OPENTOK_API_SECRET = '800592e84ac4962efe7feeb791d4fd59beeacf29',		// Replace with your API secret

	// OpenTok SDK
	ot = new opentok.OpenTokSDK(OPENTOK_API_KEY, OPENTOK_API_SECRET);
var ot_sessions;


// Sends the session info back to the client for the client to join
function getToken(sessionId) {
	if (!sessionId)
	{
			ot.createSession('www.jirachat.com',{},function(session) {
				console.log("session:" +session);
				ot_sessions['']=session;
			});				
			return ot.generateToken({session_id:ot_sessions['']});
	}
	// Construct info object to pass back to client then send it
	return ot.generateToken({session_id:sessionId});
}


exports.index = function(req, res){
	console.log(req.params.id);
  var sessionId = ot_sessions[req.params.id];
if (!sessionId)
  {
  	sessionId = ot_sessions[''];
  }  
  var token = getToken(sessionId);
  
	console.log(ot_sessions);
	console.log(sessionId);
  res.render('video', { title: 'Video Chat', sessionId: sessionId, token: token });

};

exports.setup = function(sessions)
{
	 ot_sessions = sessions;
}