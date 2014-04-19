var jiraHost = 'jira.freewebs.com';
var jiraPort = '80';
var jiraAuth = 'os_username=tools&os_password=qwerty7';
var User;

exports.setup = function(info) {
  var app = info.app;
  User = info.dbuser;
  app.get('/jira/comment', this.comment);
  app.get('/jira/users', this.users);
  app.get('/jira/user', this.user);
}
exports.comment = function(req, res) {
  var issue = req.query['issue'];
  var comment = req.query['comment'];
  var jiraPath = '/rest/api/2/issue/' + issue + '/comment' + jiraAuth;

  var http = require('http');

  var options = {
    host: jiraHost,
    path: jiraPath,
    port: jiraPort,
    method: 'POST',
    headers: {'content-type': 'application/json'}
  };

  callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      res.send("Comment created");
    });
  }

  var req = http.request(options, callback);
  req.write('{ "body": "' + comment + '" }');
  req.end();
};

exports.users = function(req, res) {
  var project = req.query['project'];
  var jiraPath = '/rest/api/2/user/assignable/search?project=' + project + '&' + jiraAuth;

  var http = require('http');

  var options = {
    host: jiraHost,
    path: jiraPath,
    port: jiraPort,
    method: 'GET'
  };

  callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      var userlistJson = JSON.parse(str);
      for(var i=0; i<userlistJson.length; i++)
      {
        var user = userlistJson[i];
        var dbUser = new User({username:user["name"], registered: new Date().toISOString()});
        dbUser.save(function(err, dbUser){
          if(err)
          {
            console.log("error saving user!");
          }
          res.send(dbUser);
        });
      }
    });
  }

  var req = http.request(options, callback);
  req.end();
};

exports.user = function(req, res) {
  var username = req.query['username'];
  var jiraPath = '/rest/api/2/user?username=' + username + '&' + jiraAuth;

  var http = require('http');

  var options = {
    host: jiraHost,
    path: jiraPath,
    port: jiraPort,
    method: 'GET'
  };

  callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str+=chunk;
    });

    response.on('end', function () {
      if(str!=='')
      {
        var userObj=JSON.parse(str);
        var dbUser = new User({username:userObj["name"], registered: new Date().toISOString()});
        dbUser.save(function(err, dbUser){
          if(err)
          {
            console.log("error saving user!");
          }
        });
      }
      res.send(str);
    });
  }

  var req = http.request(options, callback);
  req.end();
};