var sender = require('./requestSender');
var express = require('express');
var app = express();
//var gameServer = require('../gameServer');
var gameServerType = 'ASync';
var serverName = "GameServer"; //CHANGE SERVERNAME HERE. IF YOU ADD A NEW TYPE OF SERVER, EDIT THE HARDCODED ./TEST FILE
var curGameNameID = 1;

//var gameModule = require('./gameModule');

var strLog = sender.strLog;

var fs = require('fs');
const GAME_FINISH = "GAME_FINISH";
const tournamentFAIL="tournamentFAIL";
const STANDARD_PREPARE_TICK_COUNT = 5;
var UPDATE_TIME = 3000;
const PREPARED = "PREPARED";

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(function(req,res,next){
    strLog(serverName + ': Request/' + req.url);
    next();
});

app.all('/SetGame', SetGame);
app.all('/StartGame', StartGame);
app.all('/ServeGames', ServeGames);
app.all('/GetGames', GetGames);

app.get('/Alive', function (req, res){
	res.end('GET METHOD WORKED');
});
app.get('/Move', function (req, res){
	res.end('Move GET works');
});

function FastLog(text){
	var time = new Date();
	//strLog(time);
	fs.appendFile('GMLog.txt', time+' ' + text + "\n", function (err) {
		if (err) strLog('err: ' + JSON.stringify(err));
	});
	//stream.write(text);
	//strLog('FastLog: ' + text);
}

app.post('/Move', function (req,res){
	var data = req.body;
	MoveHead(data);
	var gameID = data.gameID;
	res.json(games[gameID].gameDatas);
});

function MoveHead(data){
	var tournamentID = data.tournamentID;
  	var gameID = data.gameID;
  	var movement = data.movement;
  	var userLogin = data.login;
  	//strLog('Movement of '+ userLogin + ' is: '+ JSON.stringify(movement));
  	Move(tournamentID, gameID, movement, userLogin);
}




/*funcArray["/PauseGame"] = PauseGame;
funcArray["/AbortGame"] = AbortGame;
funcArray["/UnSetGame"] = UnSetGame;*/



var games = {
	count:0

}

//strLog(JSON.stringify(games));
//------------------Writing EventHandlers---------------------------------
//YOU NEED data,res parameters for each handler, that you want to write
//you can get the object from POST request by typing data['parameterName']
//you NEED TO FINISH YOUR ANSWERS WITH res.end();

function GetGames ( req,res){
	var data = req.body;
	sender.Answer(res, games);
}

function SetGame (req, res){
	var data = req.body;
	strLog("SetGame ");
	//strLog(data);
	var gameID = data['tournamentID'];
	strLog('****FIX IT!!!!   var gameID = data[tournamentID];'  );
	games[gameID] = data;
	games[gameID].tournamentID = data['tournamentID'];
	res.end("Game " + gameID + " Is Set");
}

strLog('GMM Server starts!!');

function ServeGames (req, res){
	strLog('Game Server serves games');
	var data = req.body;
	var tournamentID = data['tournamentID'];

	var gameID = data['tournamentID'];
	strLog('FIX IT!!!!   var gameID = data[tournamentID];');

	games[gameID]= data;
	initGame(gameID);
	//strLog(games);

	res.write("serving games");
	res.end();
}

var INIT = 'INIT';
function initGame(ID){

	games[ID].curPlayerID=1;
	
	//strLog('initGame: totalPlayerCount = ' + games[ID].goNext[0]);
	games[ID].players = {};
	games[ID].players.count=games[ID].goNext[0];
	games[ID].status = INIT;

	/*for (i=0;i<games[ID].players.count;++i){
		games[ID].players[i]=0;
	}*/
	//strLog(games[ID]);
}

function Move( tournamentID, gameID, movement, userName){//Must get move from Real GameServer
	if (tournamentIsValid(tournamentID, gameID))
	{
		if (playerExists(gameID, userName)>=0) { 
			var playerID = getGID(gameID,userName);
			
			Action(gameID, playerID, movement, userName);//GET ACTION FROM GAMESERVER
		}
		else{
			strLog('#####PLAYER DOESNT exist#####');
			strLog("Player " + userName + 
				" Not your turn! Player " + curGame.curPlayerID + " must play");
		}
	}
}

function playerExists(gameID, userName){
	var playerExistsVal = getGID(gameID, userName);// games[gameID].players.UIDtoGID[userName]; //userIDs[playerID];// games[gameID].players.UIDtoGID[playerID]
	return playerExistsVal ;
}

function getGameStatus(ID){
	return games[ID].status;
}

function tournamentIsValid(tournamentID, gameID){
	return games[gameID].status === PREPARED;//
}

function Answer(res, code){
	res.end(code);
	//strLog("......................");
}

function mod2(val){
	//return val%2==0?'top':'bottom';
	return val%2==0?0:95;
}

/*function CustomInit(gameID){

}*/
var customInit;
var Action;
//var customMove

function StartGame (req, res){
	var data = req.body;
	strLog("start game: " + JSON.stringify(data));
	var ID = data['tournamentID'];
	if (!games[ID]){
		var message = 'Cannot find tournament with ID='+ ID;
		//strLog(games);
		strLog(message);
		sender.Answer(res, {result:'fail', message:message });
	}
	else{
		games[ID].status=PREPARED;
		//games[ID].players = {};
		games[ID].players.UIDtoGID = {};

		games[ID].scores = {};

		//***********
		games[ID].gameDatas = {};
		//***********


		var i=0;
		var userIDs = data['logins']; //strLog(userIDs);

		for (var playerID in userIDs){
			//strLog(playerID);
			games[ID].players.UIDtoGID[userIDs[playerID]] = i;
			games[ID].scores[userIDs[playerID]] = 0;
			i++;			
			
			//***********
			customInit(ID, playerID);
			//***********
		}
		
		games[ID].tick = STANDARD_PREPARE_TICK_COUNT;
		games[ID].timer = setInterval(function() {prepare(ID)}, 1000);

		games[ID].userIDs = userIDs;

		games[ID].socketRoom = io.of('/'+ID);

		//var room = games[ID].socketRoom;
		games[ID].socketRoom.on('connection', function (socket){
			strLog('Room <' + ID + '> got new player');
			socket.on('movement', function (data){
				//strLog('Getting socketRoom socket.on Movement');
				MoveHead(data);
			});
		});

		strLog('Players');
		strLog(games[ID].players);

		sender.Answer(res, {result:'success', message:"Starting game:" + ID });
		strLog('Answered');
	}
	//res.end();
}

function prepare(gameID){
	if (games[gameID].tick>0){
		strLog(gameID);
		games[gameID].tick--;
		SendToRoom(gameID, 'startGame', {ticks:games[gameID].tick} );
	}
	else{
		strLog('Trying to stop timer');
		clearInterval(games[gameID].timer);
		strLog('Stopped timer');
		games[gameID].timer = setInterval(function() {customUpdate(gameID) }, UPDATE_TIME);//update(gameID)
	}
}

/*function update(gameID){
	customUpdate(gameID);
	//UpdateCollisions(gameID, gameID);
	//SendToRoom(gameID, 'update', { ball: games[gameID].ball, gameDatas: games[gameID].gameDatas });
}*/



function getUID(gameID, GID){//GID= GamerID, UID= UserID
	return games[gameID].userIDs[GID];
}

function getGID(gameID, UID){//GID= GamerID, UID= UserID
	/*strLog('UID=' + UID);
	strLog(games[gameID].players.UIDtoGID);*/
	return games[gameID].players.UIDtoGID[UID];
}

function FinishGame(ID, playerID){
	var gameID = ID;
	var tournamentID = ID;
	strLog("Game " + gameID + " in tournament " + tournamentID + " ends. " + playerID + " wins!!");
	games[ID].status = GAME_FINISH;
	var sortedPlayers = { 
		scores: Sort(games[ID].scores),
		gameID: ID,
		tournamentID:ID
	};
	SendToRoom(ID, 'finish', { winner:playerID });
	clearInterval(games[gameID].timer);
	strLog('FIX IT!!! GAMEID=tournamentID');
	sender.sendRequest("FinishGame", sortedPlayers , '127.0.0.1', 
			'GameFrontendServer', null, sender.printer );
}
function Sort(players){
	return players;
}

function ScoreOfPlayer(gameID, i) {
	return games[gameID].scores[getUID(gameID, i)];//games[gameID].scores[UID];
}

function CheckForTheWinner(tournamentID, gameID) {
	for (var i = 0; i < 2; i++) {
		if (ScoreOfPlayer(gameID, i) == 3){ 
			strLog("Game " + gameID + " in tournament " + tournamentID + " ends. " + playerID + " wins!!");
			FinishGame(gameID);
		}
	}
}

var io;
function StartGameServer(options, initF, updateF, action, updateTime){
	//if (options.port)
	strLog('Trying to StartGameServer');
	if (options && initF && action){
		customInit = initF;
		customUpdate = updateF;
		UPDATE_TIME = updateTime;
		Action = action;
		var server = app.listen(options.port, function () {
		  var host = server.address().address;
		  var port = server.address().port;
		  //console.log('listening');
		  strLog('Example app listening at http://'+ host+':'+ port);
		});
		io = require('socket.io')(server);
	}
}
/*var tmr = setInterval(function(){
	if (customInit){
		customInit(1,132);
	}
}, 3000)*/

/*function incr(gameID, i){
	var userName = getUID(gameID, i);
	var game = games[gameID];

	strLog('increment score of ' + userName + ' in game ' + gameID);

	game.scores[userName]++;
	game.gameDatas[i].score++;

	if( game.scores[userName] == 3){ 
		FinishGame(gameID, userName);
	}
	else{
		incrAction();
	}
}*/

function SendToRoom( room, event1, msg){
	strLog('SendToRoom:' + room + '/'+event1+'/'+ JSON.stringify(msg));
	games[room].socketRoom.emit(event1, msg);
}

this.StartGameServer = StartGameServer;
this.app = app;
this.games = games;
this.SendToRoom = SendToRoom;
this.strLog = strLog;
this.getUID = getUID;
this.FinishGame = FinishGame;