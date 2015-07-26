//var startServer = require('./script');

var http = require('http');
var url = require('url');
var queryProcessor = require('./test');
var server = require('./script'); //var server = new http.Server();
var serverName = "FrontendServer";
var qs = require('querystring');
var sender = require('./requestSender');

/*process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});*/
var funcArray = {};//["/stop"] //'/stop' : AnswerAndKill

funcArray["/register"] = RegisterUser;

var user1 = qs.stringify({
      login: 'Dinesh',
      password: 'Kumar',
	job   : [ 'language', 'PHP' ]
    });

function RegisterUser(data, res){
	console.log("Port=" + queryProcessor.getPort('AccountServer'));
	sender.sendRequest("register", user1, '127.0.0.1', queryProcessor.getPort('AccountServer'), 
		function (res1) {
		    res1.setEncoding('utf8');
		    res1.on('data', function (chunk) {
				console.log("body: " + chunk);
				///analyse and return answer to client-bot
				console.log("Checking Data taking: " + data['password']);
				res.end("THX for register");
		    });

		    //req.on('error', function(e) {
			//console.log('problem with request: ' + e.message);
			//});
		}
	);
}
server.SetServer(serverName, '127.0.0.1', funcArray);
