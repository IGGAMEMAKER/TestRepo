var sender = require('./requestSender');
var fs = require('fs');

var Answer =  sender.Answer;
var express         = require('express');
var app = express();
var bodyParser = require('body-parser');
var Promise = require('bluebird');

var validator = require('validator');

var security = require('./Modules/DB/security');

var Log = sender.strLog;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var serverName = "DBServer"; //CHANGE SERVERNAME HERE. IF YOU ADD A NEW TYPE OF SERVER, EDIT THE HARDCODED ./TEST FILE
sender.setServer(serverName);
app.use(function(req,res,next){
    //console.log(serverName + ': Request! ' + req.url );
    next();
});

var configs = require('./configs');
// console.log(configs);


var mailer = require('./sendMail');

var domainName = configs.gameHost;//domainName
var mailAuth = { user: configs.mailUser, pass: configs.mailPass };

//console.error(mailAuth);

mailer.set(mailAuth, Log);

var handler = require('./errHandler')(app, Log, serverName);

var Stats = sender.Stats;

var Actions = require('./models/actions');
var Errors = require('./models/errors');

var Marathon = require('./models/marathon');

var sort = require('./helpers/sort');

var helper = require('./helpers/helper');

/*app.use(function(err, req, res, next){
  console.error('ERROR STARTS!!');
  //console.error(err.stack);
  //console.error('-------------');
  Log('Error happened in ' + serverName + ' : ' + err, 'Err');
  Log('Description ' + serverName + ' : ' + err.stack, 'Err');
  console.error(err);
  console.error('CATCHED ERROR!!!! IN: ' + req.url);
  res.status(500).send('Something broke!');
  next(err);
});*/


app.use((req, res, next) => {
	console.log('DB SERVER GOT REQUEST', req.url);
	next();
});

app.post('/GetUsers', GetUsers);
app.post('/Register', Register);
//app.post('/GetUserProfileInfo', GetUserProfileInfo);
app.post('/findOrCreateUser', findOrCreateUser);
app.post('/Login', LoginUser);
// app.post('/Changepassword', Changepassword);
app.post('/ResetPassword', ResetPassword);
app.post('/SetInviter', SetInviter);


app.post('/AddTournament', AddTournament);
app.post('/GetTournaments',GetTournaments);
app.post('/FinishGame', FinishGame);
app.post('/RestartTournament', function (req, res) {StartTournament(req.body.tournamentID, true, res);});
app.post('/StopTournament',  function (req, res) {StopTournament (req.body, res);});
app.post('/EnableTournament', function (req, res) {EnableTournament(req.body, res);});

app.post('/IncreaseMoney', IncreaseMoney);
app.post('/DecreaseMoney', DecreaseMoney);



app.post('/RegisterUserInTournament', function (req, res) {RegisterUserInTournament(req.body, res);} );
app.post('/CancelRegister', function (req, res) { CancelRegister(req.body, res); })
app.post('/Autoreg', Autoreg);
app.post('/GetPlayers', GetPlayers);


//app.post('/BanUser', BanUser);


app.post('/AddGift', function (req, res) {AddGift(req.body, res);});
app.post('/ShowGifts', function (req, res){ShowGifts(req.body, res);});
app.post('/GetGift', function (req, res){GetGiftByGiftID(req.body, res);})

app.post('/GetTransfers', GetTransfers);
app.post('/CashoutRequest', CashoutRequest);
app.post('/MoneyTransfers', MoneyTransfers);

app.post('/AddMessage', AddMessage);
app.post('/GetMessages', GetMessages);


//app.post('/Actions', Actions);

app.post('/GetFrontendVersion', GetFrontendVersion);

app.post('/payment', function(req, res){ 
	console.log("new payment");
	IncreaseMoney(req, res);
});

app.post('/Mail', function (req, res){
	Stats('Mail', {});
	mailer.sendStd('23i03g@mail.ru', 'API Mail test', 'TEXT TEXT','TXT2', res);
});

app.post('/StartSpecial', function(req, res){
	sender.Answer(res, OK);

	StartSpecial(req.body.tournamentID);
});

app.post('/GetTournamentAddress' , GetTournamentAddress);

var Fail = {
	result: 'fail'
};
var OK = {
	result: 'OK'
};

const TOURN_STATUS_REGISTER = 1;
const TOURN_STATUS_RUNNING = 2;
const TOURN_STATUS_FINISHED = 3;
const TOURN_STATUS_PAUSED = 4;

const PROMO_COMISSION = 5;


const GET_TOURNAMENTS_USER = 1;
const GET_TOURNAMENTS_BALANCE = 2;
const GET_TOURNAMENTS_GAMESERVER = 3;
const GET_TOURNAMENTS_INFO = 4;
const GET_TOURNAMENTS_RUNNING = 5;
const GET_TOURNAMENTS_UPDATE = 6;

const STREAM_ERROR = 'Err';
const STREAM_TOURNAMENTS = 'Tournaments';
const STREAM_USERS = 'Users';
const STREAM_SHIT = 'shitCode';
const STREAM_WARN = 'WARN';
const STREAM_STATS = 'stats';
const STREAM_GAMES = 'Games';

const CURRENT_CRYPT_VERSION = 2;

function Error(err, message, additionalStream){
	var txt='DBServer Error: ';
	if (message){
		txt += message + ' ';
	}
	if (err){
		txt += JSON.stringify(err) + ' ';
	}
	Log(txt, STREAM_ERROR);
	if (additionalStream) Log(txt, STREAM_ERROR);

	console.error(txt);
}


var currentTournamentCounter=0;
var tournaments = {};

var users= {count:0 };
var IDToLoginConverter = {count:0};

var errObject = {result:'error'};


var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
mongoose.connect('mongodb://'+configs.db+'/test');

var User = mongoose.model('User', { login: String, password: String, money: Number, 
	email: String, activated:String, date: Date, link: String, bonus: Object, 
	salt:String, cryptVersion:Number, social:Object, inviter:Object });

var Game = mongoose.model('Game', { 
	gameName: String, gameNameID: Number,
	minPlayersPerGame: Number, maxPlayersPerGame:Number,
	frontendServerIP: String, frontendServerPort:Number, 
	token: String
});

var TournamentReg = mongoose.model('TournamentRegs', {	tournamentID: Number, userID: String, promo:String, status:Number, date:Date });

var Gift = mongoose.model('Gift', { name: String, photoURL: String, description: String, URL: String, price: Number, sended:Object, date:Date });

var UserGift = mongoose.model('UserGifts', { userID: String, giftID: String });
var MoneyTransfer = mongoose.model('MoneyTransfer', {userID: String, ammount:Number, source: Object, date: Date});

var Message = mongoose.model('Message', {text:String, senderName:String, date: Date, isPrivate: Boolean});

//var TournamentResult = mongoose.model('TournamentResults', {tournamentID: String, userID: String, place:Number, giftID: String});
//var TournamentResults = mongoose.model('TournamentResults', {tournamentID: String, results: Array});

var Configs = mongoose.model('Configs', {name:String, value: String});

var models = require('./models.js')(configs.db);
// console.log(models);

var Tournament = models.Tournament;
// var Tournament = mongoose.model('Tournament', { 
// 	buyIn: 			Number,
// 	initFund: 		Number,
// 	gameNameID: 	Number,

// 	pricingType: 	Number,

// 	rounds: 		Number,
// 	goNext: 		Array,
// 		places: 		Array,
// 		Prizes: 		Array,
// 		prizePools: 	Array,

// 	comment: 		String,

// 	playersCountStatus: Number,///Fixed or float
// 		startDate: 		Date,
// 		status: 		Number,	
// 		players: 		Number,
// 	tournamentID:		Number,

// 	settings: 			Object,

// 	startedTime: 		Date,
// 	playTime: Date,
// 	finishTime: Date
// 	//tournamentServerID: String
// });

function create_config(name, value, res){

	var cfg = new Configs({name: name, value: value});

	cfg.save(function (err){
		if (err) return sender.Answer(res, null);

		return res.end(value);
	})
}

function GetFrontendVersion(req, res){
	Configs.findOne({name:'frontendVersion'}, function (err, version){
		if (err) return res.json({frontendVersion:null});//return sender.Answer(res, null);

		if (version){
			return res.json({frontendVersion:version});
		} else {
			return res.json({frontendVersion:null});
		}
	});
}


function dayQuery(date){
	var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	var tmrw 	= new Date(date.getFullYear(), date.getMonth(), date.getDate());
	tmrw.setDate(tmrw.getDate() + 1);

	//console.log(today, tmrw);

	var query = {
		// $gte : ISODate("2015-11-02T00:00:00Z"), 
		// $lt : ISODate("2014-07-03T00:00:00Z")
		$gte : today, 
		$lt : tmrw 
	}
	return query;
}


function SERVER_ERROR(err, res){
	Error(err);
	if (res){
		Answer(res, Fail);
	}
}

function servError(err, res){
	Error(err);
	if (res){
		Answer(res, {result:'ServerError'} );
	}
}



//var uGift = new UserGift({ userID: 'Alvaro_Fernandez', giftID: '5609a7da4d4145c718549ab3' });//ObjectId(
/*var uGift = new UserGift({ userID: 'Alvaro_Fernandez', giftID: '5609b3a58b659cb7194c78c5' });//ObjectId(

uGift.save(function (err){
	if (err) {Error(err);}
})*/

/*function ProcessPayment(req, res){

}*/

function AddMessage(req, res){
	var data = req.body;
	
	var message = new Message({text:data.text, senderName:data.sender, date:now() });

	message.save(function (err){
		if (err) return sender.Answer(res, null);

		return sender.Answer(res, OK);
	})
}

function GetMessages(data, res){
	Message.find({},'', function (err, messages){
		if (err) return sender.Answer(res, null);

		return sender.Answer(res, messages);
	})
}


function AddGift(data, res){
	Log('trying to add gift '+ JSON.stringify(data), 'Gifts');
	if (data){
		gift = new Gift(data);
		gift.save(function (err){
			if (err){
				Error(err);
				Answer(res, Fail);
			}
			else{
				Log('Added gift ' + JSON.stringify(data), 'Gifts');
				Answer(res, OK);
			}
		})
	}
	else{
		Log('No addition. Gift is null', 'Gifts');
		Answer(res, Fail);
	}
}

function GetGiftByGiftID(data, res){
	if (data){
		Gift.findOne({ _id : data.giftID}, function (err, gift){
			if (err){
				Error(err);
				Answer(res, Fail);
			}
			else{
				Answer(res, gift);
			}
		});
	}
	else{
		Answer(res, Fail);
	}
}

function ShowGifts(data, res){
	if (data){
		Gift.find(data, function (err, gifts){
			if (err){
				Error(err);
				Answer(res, Fail);
			}
			else{
				Answer(res, gifts);
			}
		});
	}
	else{
		Answer(res, Fail);
	}
}


var OBJ_EXITS = 11000;

//addGame('Battle', 3, {port:5011, maxPlayersPerGame:2} );
function addGame(gameName, gameNameID, options ){
	var minPlayersPerGame = options.minPlayersPerGame||2;
	var maxPlayersPerGame = options.maxPlayersPerGame||10;
	var frontendServerIP = '127.0.0.1';
	var frontendServerPort = options.port;
	var token = 'tkn';

	var game = new Game({
		gameName:gameName, gameNameID:gameNameID,
		minPlayersPerGame:minPlayersPerGame, maxPlayersPerGame:maxPlayersPerGame, 
		frontendServerIP:frontendServerIP, frontendServerPort: frontendServerPort,
		token: token
	})

	game.save(function (err) {
		if (err){
			switch (err.code){
				case OBJ_EXITS:
					Log('Sorry, game ' + gameName + ' Exists');
					// Answer(res, {result: 'OBJ_EXITS'});
				break;
				default:
					Error(err);
				break;
			}
		}
		else{
			// Answer(res, {result: 'OK'});
			Log('added Game'); 
		}
	});
}



function SetInviter(req, res){
	var data = req.body;

	var login = data.login;
	var inviter = data.inviter;

	//check if it is a newbie
	User.findOne({login:login},function (err, user){
		if (err) return Answer(res, null);

		if (user.money==0) { // not registered at all

			if (!inviter){
				register_to_stream(login);

				setTimeout(function(){
					Answer(res, OK);
				}, 300);
			} else {
				User.update({ login:login, inviter: {$exists : false} }, {$set:{ inviter:inviter }}, function (err, count){
					if (err) return	Answer(res, null);

					register_newbie_in_tournament(login);
					
					setTimeout(function(){
						if (updated(count)){
							Answer(res, OK);
							Log("Registered via " + inviter, STREAM_USERS);
						} else {
							Answer(res, null);
						}
					}, 300);
				})
			}

		} else {
			Answer(res, OK);
		}
	})
}

function EnableTournament(data, res){

	if (data && data.tournamentID){
		setTournStatus(data.tournamentID, TOURN_STATUS_REGISTER);
		Answer(res, OK);
	} else {
		Answer(res, Fail);
	}

}

function makeUserArray(userRegs){
	var arr = [];
	for (var i = userRegs.length - 1; i >= 0; i--) {
		arr.push(userRegs[i].userID);
	};
	return arr;
}

function getBuyInOfTournament(tournamentID){
	return new Promise(function (resolve, reject){
		// console.error('Starting Promise');
		Tournament.findOne({tournamentID:tournamentID},'buyIn tournamentID', function (err, tournament){
			if (err) {
				console.err('Tournament buyIn not found. ' + JSON.stringify(err));
				reject(err);
			}	else {
				if (tournament){
					if (tournament.buyIn>=0){
						Log('Tournament found. ' + JSON.stringify(tournament));
						resolve(tournament);
					} else {
						console.log('Tournament ' + tournamentID +' was free, no returns needed');
						reject('Tournament ' + tournamentID +' was free, no returns needed');
					}
				} else {
					console.error('Tournament not found. ' + JSON.stringify(tournament));
					reject('Tournament not found. ' + JSON.stringify(tournament));
				}
			}

		});
	});
}



function str(obj){
	return ' '+JSON.stringify(obj)+' ';
}


function pGetPlayers (obj){
	// needs tournamentID
	return new Promise(function (resolve, reject){
		// console.error('Continue Promise ' + JSON.stringify(obj));
		TournamentReg.find({tournamentID:obj.tournamentID},'userID', function (err, players){
			if (!err){
				//Answer(res, players);
				//console.error('Players :' + JSON.stringify(players) );
				var obj2 = {tournamentID: obj.tournamentID, players:makeUserArray(players), buyIn: obj.buyIn};
				console.log('Players now :' + JSON.stringify(obj2));
				//obj.players=players;

				resolve(obj2);
			} else {
				console.error(err);
				reject('Error ' + JSON.stringify(err) );
				//Answer(res, Fail);
			}
		});
	})
}

app.post('/RunningTournaments', function (req, res){
	console.error('RunningTournaments');
	getRunningTournaments(res);
})

function getRunningTournaments (res) {
	Tournament.find({status:TOURN_STATUS_RUNNING},'', function (err, tournaments){
		if (err) { SERVER_ERROR(err, res); return; }
		var running = [];
		for (var i in tournaments){

			running.push(tournaments[i].tournamentID);
		}
		Answer(res, running);
	})
}


checkRunningTournaments();

function checkRunningTournaments () {
	setTimeout(function (){
		// console.error('checkRunningTournaments');
		Tournament.find({status:TOURN_STATUS_RUNNING},'', function (err, tournaments){
			if (err) { 
				Errors.add('','checkRunningTournaments', {err:err}) 
			} else {
				for (var i = tournaments.length - 1; i >= 0; i--) {
					var t = tournaments[i];
					var tournamentID = t.tournamentID;
					var diff = (new Date() - t.playTime)/1000;

					if (diff>120){
						console.error('NEEDS TO STOP', tournamentID, diff)
						Errors.add('', 'force-stop', { tournament: t});
						StopTournament(t);
						AutoAddTournament(t);
					}
					console.error(tournamentID, diff);
				};
			}
		})
		checkRunningTournaments();
	}, 5000)
}

function retMoney(tournament){
	return new Promise( function (resolve, reject){
		// console.error('Last Promise ' + JSON.stringify(tournament) );
		for (var index in tournament.players){
			var user = tournament.players[index];
			var money = parseInt(tournament.buyIn);
			console.log('Incr money of user ' + user+ ' by ' + money + ' points');
			if (money>0) { 
				incrMoney(null, user, money, {
					type:SOURCE_TYPE_CANCEL_REG, 
					tournamentID: tournament.tournamentID
				});
			}	else {
				if (money<0) console.error('Money error: ' + money);
				reject('Money error: '+ money);
			}
		}
		console.log('Money OK: ');
		resolve(tournament);
	})
}

function ReturnBuyInsToPlayers(tournamentID){
	console.error('return BuyIns ' + tournamentID);
	getBuyInOfTournament(tournamentID)
	.then(pGetPlayers)//get userIDs
	.then(retMoney)
	.catch(Error);
}

function StopTournament(data, res){
	KillFinishedTournaments();
	Log('DB.StopTournament needs promises!!!', STREAM_SHIT);
	Log('RETURN MONEY TO USERS, WHO TOOK PART IN STOPPED TOURNAMENT', STREAM_SHIT);

	if (data && data.tournamentID){
		Log('DBServer starts tournament ' + data.tournamentID, STREAM_TOURNAMENTS);
		setTournStatus(data.tournamentID, TOURN_STATUS_FINISHED);
		ClearRegistersInTournament([data.tournamentID]);
		ReturnBuyInsToPlayers(data.tournamentID);


		if (res) Answer(res, OK);
		
		multiLog('StopTournament ' + JSON.stringify(data), [STREAM_TOURNAMENTS, 'Manual'] );
	}
	else{
		Log('StopTournament: no tournamentID, no fun!', STREAM_WARN);

		if (res) Answer(res, Fail);
	}
}


function StartTournament(tournamentID, force, res){
	var gameNameID;
	var players;
	Log("Tournament " + tournamentID + " starts", STREAM_TOURNAMENTS);
	
	Tournament.findOne({tournamentID:tournamentID}, 'gameNameID', function (err, tournament){
		if (err) {SERVER_ERROR(err, res); return;}
		if (!tournament) {SERVER_ERROR(null, res); return;}
		
		gameNameID = tournament.gameNameID;

		TournamentReg.find({tournamentID:tournamentID}, '', function (err, regs){
			players = [];
			//var obj = [];
			for (var a in regs){ players.push( regs[a].userID);	}

			var obj = getPortAndHostOfGame(gameNameID);
			obj.tournamentID = tournamentID;
			obj.logins = players;
			if (force) obj.force = true;

			//Log('StartTournament: ' + str(obj), STREAM_TOURNAMENTS);
			TournamentLog(tournamentID, 'Tournament starts... ' + str(players));
			TournamentLog(tournamentID, 'start Object:' + str(obj));

			setTournStatus(tournamentID, TOURN_STATUS_RUNNING);

			sender.sendRequest("StartTournament", obj, '127.0.0.1', 'FrontendServer', null, sender.printer);
			
			if (!force) {
				sender.Stats('StartTournament', {tournamentID:tournamentID, players:players });
			}	else {
				sender.Stats('RestartTournament', {tournamentID:tournamentID});
			}
			
			if (res) Answer(res, OK);
		})
	})
}

function last (Arr){
	return Arr[Arr.length-1];
}

function FinishGame (req, res){
	var data = req.body;

	Log(data);
	var gameID = data['gameID'];
	var tournamentID = data['tournamentID'];
	var scores = data['scores'];
	
	Log('******************* game Finishes *********' + gameID + '****************', 'Tournaments');
	Log('EndTournament: ' + tournamentID, 'Tournaments');
	EndTournament(scores, gameID, tournamentID);
	
	sender.Answer(res, {result: 'OK', message: 'endingTournament'+tournamentID} );
}

function give_marathon_points_to_user(login, MarathonID){
	console.error('give_marathon_points_to_user', login, MarathonID);

	Marathon.find_or_create_user(login, MarathonID)
	.then(function (user){
		// console.error('user found or created', user);
		return Marathon.increase_points(login, MarathonID);
	})
	.then(function (result){
		Log('increased marathon points to ' + login + '  ' + str(result), STREAM_GAMES);
	})
	.catch(helper.catcher);
}



function give_marathon_points(tregs){
		
	// console.error('give_marathon_points', tregs);
	
	//console.error(Marathon);
	Marathon.get_current_marathon()
	.then(function (marathon){
		if (marathon){
			var MarathonID = marathon.MarathonID;
			// console.error('got marathon', marathon, tregs.length - 1);
			for (var i = tregs.length - 1; i >= 0; i--) {
				var login = tregs[i].userID;
				// console.error('trying to increase marathon points to ' + login + '  ', tregs[i]);
				Log('trying to increase marathon points to ' + login + '  ', STREAM_GAMES);
				give_marathon_points_to_user(login, MarathonID);
			};
		}
	})
	.catch(helper.catcher);

}

function EndTournament( scores, gameID, tournamentID){
	TournamentReg.find({tournamentID: tournamentID}, function (err, tregs){
		if (err) { 
			SERVER_ERROR(err); 
			console.error('CANNOT give_marathon_points. DB Error', err); 
		} else {
			give_marathon_points(tregs);
		}
	})

	Tournament.findOne({tournamentID:tournamentID, status:TOURN_STATUS_RUNNING},'goNext', function (err, tournament){
		if (err) { SERVER_ERROR(err); return; }

		if (!tournament) {console.error('EndTournament not found'); return;}

		sender.Stats('FinishedTournament', {tournamentID: tournamentID}); 
		Log(scores);
		
		var obj = sort.winners(scores); 

		/*
			var obj = [];
			for (var a in scores){ obj.push( { value:scores[a], login: a } );	}

			obj.sort(sort_by('value', true, parseInt));
			
			var winnersCount = tournament.goNext[0];
			Log('Prizes will go to ' + winnersCount + ' first users. ' + str(obj) );
			Log(tournaments[tournamentID]);
		*/
		TournamentLog(tournamentID, 'Winners:'+str(obj));



		WinPrize({winners:obj, tournamentID:tournamentID});

	})
}



var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}


function GetTournamentAddress(req, res){
	var tournamentID = req.body.tournamentID;
	//Log('BODY : ' + JSON.stringify(req.body), STREAM_TOURNAMENTS);
	//Log('get addr of ' + tournamentID, STREAM_TOURNAMENTS);

	Tournament.findOne({tournamentID:tournamentID}, '', function (err, tournament){
		if (err) { SERVER_ERROR(err, res); return;}
		if (!tournament) { SERVER_ERROR('tournament not found', res); return;}
		var gameNameID = tournament.gameNameID;
		var a = getPortAndHostOfGame(gameNameID);
		
		a.running = tournament.status==TOURN_STATUS_RUNNING;//||null;
		//Log(JSON.stringify(a), STREAM_TOURNAMENTS);

		sender.Answer(res, {address: a});
	})
}


var gameHost = configs.gameHost;

function getPortAndHostOfGame(gameNameID){
	Log('getPortAndHostOfGame. REWRITE IT!!!!');

	switch (gameNameID)
	{
		case 1: return { port:5009, host: gameHost }; break; // PPServer
		case 2: return { port:5010, host: gameHost }; break; // QuestionServer
		case 3: return { port:5011, host: gameHost };	break; // BattleServer
		default:
			//Log('Some strange gameNameID !!' + gameNameID,'WARN');
			return { port:5010, host: gameHost };//QuestionServer
		break;
	}
}


function MoneyTransfers(req, res){
	MoneyTransfer
	.find({userID: req.body.login})
	.sort('-date')
	.exec(function (err, transfers){
		if (err) { Err(err, res); }
		else{
			Answer(res, transfers);
		}
	})
}

function TournamentLog(tournamentID, message){
	var time = new Date();
	//console.log('TournamentLog LOGGING!!!!');
	fs.appendFile('Logs/Tournaments/' + tournamentID + '.txt', '\r\n' + time + ' TS: ' + message + '\r\n', function (err) {
		if (err) {Log(err); throw err; }
		//console.log('The "data to append" was appended to file!');
	});
}


function clearRegister(tournamentID, login){
	return new Promise(function (resolve, reject){
		TournamentReg.remove({userID:login, tournamentID:tournamentID}, function (err, count){
			if (err){ reject(err); }
			else{
				if (removed(count)) { 
					resolve(1);
				}	else {
					reject(null);
				}
			}
		});

	});
}

function incrMoney1(login, cash, source) {
	return new Promise(function (resolve, reject){
		Log('incrMoney: give ' + cash + ' points to ' + login);
		if (cash<0){ cash*= -1;}
		
		User.update( {login:login}, {$inc: { money: cash }} , function (err,count) {
			if (err){ reject(err); }
			else{
				if (updated(count)){
					cLog('IncreaseMoney----- count= ' + count + ' ___ ' +login);
					Log('SAVE TRANSFER NEEDS OWN Promise!!', STREAM_SHIT);
					resolve(1);
				} else {
					reject(null);
				}
			}
		});
	});
}

function CancelRegister(data, res){
	var login = data.login;
	var tournamentID = data.tournamentID;
	var buyIn;
	getUnRegistrableTournament(tournamentID)
	.then(function (tournament){
		buyIn = tournament.buyIn;

		return clearRegister(tournamentID, login);
	})
	.then(function (cleared){
		return incrMoney1(login, buyIn, { type: SOURCE_TYPE_CANCEL_REG, tournamentID: tournamentID });
	})
	.then(function (saved){
		return pSaveTransfer(login, buyIn, { type: SOURCE_TYPE_CANCEL_REG, tournamentID: tournamentID });
	})
	.then(function (increased){
		return changePlayersCount(tournamentID, -1);
	})
	.then(function (msg){
		Answer(res, OK);

		Actions.add(login, 'tournament.leave', {tournamentID:tournamentID});
	})
	.catch(function (err){
		cLog('CATCHED error while CancelRegister'); cLog(err);
		Error(err);
		Answer(res,Fail);
	})
}

function removed(count){
	console.error(count.result);
	return count.result.n>0;
}


const SOURCE_TYPE_BUY_IN = 'BuyIn'
,SOURCE_TYPE_WIN = 'Win'
,SOURCE_TYPE_PROMO = 'Promo'
,SOURCE_TYPE_CANCEL_REG = 'Cancel'
,SOURCE_TYPE_CASHOUT = 'Cashout'
,SOURCE_TYPE_DEPOSIT = 'Deposit'
,SOURCE_TYPE_ACCELERATOR_BUY= 'BuyAccelerator';

function payBuyIn(buyIn, login){
	return new Promise(function (resolve, reject){
		console.log('payBuyIn', buyIn, login);
		User.update({login:login, money: {$not : {$lt: buyIn }} }, {$inc : {money: -buyIn} }, function takeBuyIn (err, count) {
			if (err) { reject(err); } 
			else {
				if (updated(count)) { 
					resolve(true);
				} else {
					reject(TREG_NO_MONEY);
				}
			}
		});
	})
}

function saveReg(tournamentID, login, promo){
	return new Promise(function (resolve, reject){
			var reg = new TournamentReg({userID:login, tournamentID: parseInt(tournamentID), promo:promo, date:new Date() });
			reg.save(function (err) {
				if (err) reject(err);
				
				Log('added user to tournament');
				resolve(true);
			});
	})
}

function findTournamentReg(tournamentID, login){
	return new Promise(function (resolve, reject){
		TournamentReg.findOne({tournamentID:tournamentID, userID:login},'', function (err1, reg){
			if (err1) {
				reject(err1);
				console.error('reg:', reg);
			}

			if (reg) {
				reject(TREG_ALREADY);
			} else {
				resolve(true);
			}

		})
	})
}

var REGULARITY_NONE=0;
var REGULARITY_REGULAR=1;
var REGULARITY_STREAM=2;

var SPECIALITY_SPECIAL=1;

function isStreamTournament(tournament){
	return tournament.settings && tournament.settings.regularity==REGULARITY_STREAM;
}

function isRegularTournament(tournament){
	return tournament.settings && tournament.settings.regularity==REGULARITY_REGULAR;
}

function isSpecialTournament(tournament){
	return tournament.settings && tournament.settings.special==SPECIALITY_SPECIAL;
}

function getRegistrableTournament(tournamentID){
	return new Promise(function (resolve, reject){
		//{$or: [{status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER}] };
		/*var run_or_reg = {$or: [ {status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER} ] };
		query = { $and : [query, run_or_reg] };*/

		Tournament.findOne({tournamentID:tournamentID}, '', function (err, tournament) {
			if (err) { Error(err); reject(err); }
			else{
				if (tournament) {
					if (tournament.status==TOURN_STATUS_REGISTER || (isStreamTournament(tournament) && tournament.status==TOURN_STATUS_RUNNING)) {
						//console.log('getRegistrableTournament', tournament);
						resolve(tournament);
					} else {
						reject(TREG_FULL);
					}
				} else {
					reject(TREG_FULL);
				}
			}
		})

	})
}

function getUnRegistrableTournament(tournamentID){
	return new Promise(function (resolve, reject){

		Tournament.findOne({tournamentID:tournamentID, status:TOURN_STATUS_REGISTER}, '', function (err, tournament) {
			if (err) { Error(err); reject(err); }
			else{
				if (tournament && tournament.players>0) { 
					// console.log('getUnRegistrableTournament', tournament);
					resolve(tournament);
				} else {
					reject(null);
				}
			}
		})

	})
}

var TREG_NO_MONEY='TREG_NO_MONEY';
var TREG_FULL='TREG_FULL';
var TREG_ALREADY = 'Registered';

function register_in_tournament(login, tournamentID){
	return RegisterUserInTournament({tournamentID:tournamentID, login:login}, null);
}

function Autoreg(req, res){
	var login = req.body.login;
	var tournamentID = req.body.tournamentID;

	if (login && tournamentID){
		autoreg(login, tournamentID);
	}

	res.end('');
}

function autoreg(login, tournamentID){
	register_in_tournament(login, tournamentID);
	//return RegisterUserInTournament({tournamentID:tournamentID, login:login}, null);
}

function RegisterUserInTournament(data, res){
	var tournamentID = data.tournamentID;
	var login = data.login;


	var buyIn;
	var playerCount;
	var maxPlayers;
	var TT;
	getRegistrableTournament(tournamentID)
	.then(function (tournament) {
		TT = tournament;
		console.log(tournament);
		buyIn = tournament.buyIn;
		playerCount = tournament.players;
		maxPlayers = tournament.goNext[0];
		if (tournament.settings && tournament.settings.regularity==REGULARITY_STREAM){
			sender.sendRequest("Join", {login:login, gameID:tournamentID} ,'127.0.0.1', tournament.gameNameID);
		}
		return findTournamentReg(tournamentID, login);
	})
	.then(function (savingSuccess){	//console.log('savingSuccess');
		return payBuyIn(buyIn, login);
	})
	.then(function (reg){
		return saveReg(tournamentID, login, 'gaginho');
	})
	.then(function (paymentSucceed){ //console.log('paymentSucceed');
		return pSaveTransfer(login, -buyIn, {type:SOURCE_TYPE_BUY_IN, tournamentID:tournamentID});
	})
	.then(function (increased){	//console.log('increased'); //return incrPlayersCount(tournamentID);
		return changePlayersCount(tournamentID);
	})
	.then(function (saved){
		if (res) Answer(res, OK);
		Actions.add(login, 'tournament.join', {tournamentID:tournamentID});

		if (playerCount==maxPlayers-1){
			StartTournament(tournamentID);
		} else {
			if (playerCount>maxPlayers-1){
				// stream tournaments addition
				var newGoNext = TT.goNext;

				/*Log('goNext was '+JSON.stringify(newGoNext), STREAM_TOURNAMENTS);
				Log('goNext was '+JSON.stringify(newGoNext), STREAM_USERS);*/

				newGoNext[0]++;
				Log('goNext now ' + JSON.stringify(newGoNext), STREAM_TOURNAMENTS);

				Tournament.update({tournamentID:tournamentID}, {$set :{goNext: newGoNext} }, function (err, count){
					if (err) return 0;

					if (updated(count)) { 
						Log('goNext updated', STREAM_TOURNAMENTS);

					} else {
						Log('goNext update FAILED', STREAM_TOURNAMENTS);
					}
				});
			}
		}
	})
	.catch(function (err){
		console.log('CATCHED error while player registering!', err);
		if (res) { 
			switch (err){
				case TREG_FULL: Answer(res, { result: TREG_FULL } ); break;
				case TREG_ALREADY: Answer(res, { result: TREG_ALREADY }); break;
				case TREG_NO_MONEY: Answer(res, { result: buyIn }); break;
				default: Answer(res, Fail); break;
			}
		}
		Error(err);
		Errors.add(login, 'RegisterUserInTournament', { tournamentID:tournamentID, code:err })
	})
}

function getTournament(tournamentID){
	return new Promise(function (resolve, reject){
		Tournament.findOne({tournamentID:tournamentID}, '', function (err, tournament) {
			if (err) { Error(err); reject(err); }
			else{
				if (tournament) resolve(tournament);
				reject(null);
			}
		})
	})
}

function incrPlayersCount(tournamentID){
	return new Promise(function (resolve, reject){
		Tournament.update({tournamentID:tournamentID}, {$inc: {players:1}} , function (err, count){
			if (err){	reject(err); return; } 
			resolve(true);
		});
	})
}

function changePlayersCount(tournamentID, mult){
	if (!mult) {mult = 1;}
	/*return new Promise(function (resolve, reject){
		Tournament.update({tournamentID:tournamentID}, {$inc: {players:1*mult}} , function (err, count){
			if (err){	reject(err); }
			else{
				if (updated(count)){
					resolve(1);

				} else {
					reject('changePlayersCount');
				}
			}
		});
	})*/
	return new Promise(function (resolve, reject){
		TournamentReg.find({tournamentID:tournamentID}, '', function (err, regs){
			if (err) {reject(err);}
			else{
				var playerCount = regs.length;
				console.log('changePlayersCount playerCount: '+ playerCount);
				
				Tournament.update({tournamentID:tournamentID}, {$set : {players:playerCount}}, function (err, count){
					if (err){	reject(err); }
					else{
						if (updated(count)){
							resolve(1);
						} else {
							reject('changePlayersCount');
						}
					}
				})
			}
		})
	});
}

function Printer(err, count){
	if (err){ Error(err); }
}

function cLog(data){
	console.log(data);
}

function GetPlayers (req, res){
	var query = req.body;
	TournamentReg.find({tournamentID:query.tournamentID},'', function (err, players){
		if (!err){
			 Answer(res, players);
		}
		else{
			 Answer(res, Fail);
		}
	});
}

function updated(count){
	//console.log('Updated : ' + JSON.stringify(count), STREAM_USERS );
	return count.n>0;
}

function HASH(password){
	//return password;
	return security.Hash(password, CURRENT_CRYPT_VERSION);
}
// 
function resetPassword(user){
	return new Promise(function (resolve, reject){
		var login = user.login;
		var email = user.email;
		var newPass = security.create_random_password();//HASH();
		Log('Filter passwords, when you change them!!', STREAM_SHIT);

		User.update({login:login, email:email}, {$set : { password:HASH(newPass), cryptVersion:CURRENT_CRYPT_VERSION } }, function (err, count){
			if (err) { Log(err, STREAM_ERROR); reject(err); }
			else{
				if (updated(count)) {
					Log('resetPassword OK '+ login + '  ' + newPass, STREAM_USERS);	
					user.password = newPass;
					resolve(user); // Answer(res, OK);
				} else {
					Log('resetPassword Fail '+login + ' ', STREAM_USERS);
					reject(Fail);	// Answer(res, Fail);
				}
			}
		})

	})
}

/*function Changepassword(req, res){
	var data = req.body;
	var login = data.login;
	var oldPass = data.oldPass;
	var newPass = data.newPass;

	Log('Filter passwords, when you want to change them!! Changepassword', STREAM_SHIT);
	User.findOne({login:login}, '', function (err, user){
		if (err) { servError(err, res); }
		else{
			if (!user) { 
				Log('no user in Changepassword');
				return Answer(res, Fail);
			}

			Log('Changepassword', STREAM_USERS);
			if (passwordCorrect(user, oldPass)){
				update_password(login, newPass, CURRENT_CRYPT_VERSION, res);
			} else {
				Answer(res, Fail);
			}
		}
	})
}*/


function ResetPassword(req, res){
	var data = req.body;
	Log('these actions must be done together!! ResetPassword', STREAM_SHIT);
	var login = data.login;
	Stats('ResetPassword', {login:login});

	resetPassword(data)
	.then(sendResetPasswordEmail)
	.then(function (result){
		Answer(res, OK);
		//Stats('ResetPasswordOK', {login:login});
		Log("Sended mail and reset pass. Remember pass of User " + JSON.stringify(result), STREAM_USERS);
		Log('still in then function');
	})
	.catch(function (err){
		Log(err, STREAM_ERROR);
		//Stats('ResetPassword', {login:login, result:});
		Answer(res, err);
		Stats('ResetPasswordFail', {login:login});
	})
}



function passwordCorrect(user, enteredPassword){
	return security.passwordCorrect(user, enteredPassword);
}

function update_password (login, password, cryptVersion, res) {
	var newPass = security.Hash(password, cryptVersion);

	User.update({login:login}, {$set : {password:newPass, cryptVersion:CURRENT_CRYPT_VERSION} }, function (err, count){
		if (err) { 
			Error(err, 'CANNOT UPDATE PASSWORD TO NEWER ALGORITHM ' + CURRENT_CRYPT_VERSION); 
			if(res) Answer(res, Fail); 
		}	else { 

			if (updated(count)) {
				Log('PASSWORD updated while login'); 
				if (res) Answer(res, OK);
			} else {
				if(res) Answer(res, Fail);
			}

		}
	});
}
// 
function LoginUser(req, res){
	var data = req.body;
	cLog("LoginUser... " + JSON.stringify(data));

	var login = data['login'];
	var password = data['password'];
	//Log('Try to login :' + login + '. (' + JSON.stringify(data) + ')', STREAM_USERS);

	var usr1 = User.findOne({login:login}, 'login password cryptVersion salt' , function (err, user) {    //'login money'  { item: 1, qty: 1, _id:0 }
		if (err) {
			Error(err, 'CANNOT LOG IN USER!!!');
			Answer(res, {result: err});
		}	else {
			if (user && passwordCorrect(user, password) ){
				Log('Logged in ' + JSON.stringify(user), STREAM_USERS);
				Answer(res, OK);
				if (user.cryptVersion!=CURRENT_CRYPT_VERSION){
					update_password(login, password, CURRENT_CRYPT_VERSION);		    	
				}
			}	else {
				Log('Invalid login/password : ' + login, STREAM_USERS);
				Answer(res, {result:'Invalid reg'});
			}
		}
 	});
}


function GetGameParametersByGameName (gameName){
	Log('GetGameParametersByGameName... HERE MUST BE REAL REQUEST TO DATABASE');
	switch(gameName){
		case GM_ABSTRACT_SYNC:
			return {minPlayersPerGame:2, maxPlayersPerGame:3};
		break;
		default:
			return {minPlayersPerGame:2, maxPlayersPerGame:0};
		break;
	}
}

function GetUsers( req,res){
	//throw new Error('Catch Me If You Can');
	var data = req.body;
	var query = {};
	var queryFields = '';//'id buyIn goNext gameNameID';
	
	if (data['query']) {query = data['query'];}
	if (data['queryFields']) {queryFields = data['queryFields'];}


	/*Log(query);
	Log(queryFields);*/

	/*Tournament.find(query,queryFields , function (err, tournaments){
		Log(tournaments);
		 Answer(res, tournaments);
	});*/

	User.find(query, 'login money' , function (err, users) {    //'login money'  { item: 1, qty: 1, _id:0 }
		if (err) {
			Error(err, 'GetUsersError ');
			Answer(res, errObject);
		} else {
			Answer(res, users);
		}
 	});
}

function send_cashout_email(login, money, cardNumber){
	mailer.sendStd(configs.mailUser, 'Cashout Request', 'user ' + login + ' needs ' + money + '$.<br> User cardNumber is : ' + cardNumber,'TXT2', null);
}

function send_no_money_email(login, money){

}

function CashoutRequest(req, res){

	var data = req.body;
	Log("trying to cashout DB" + JSON.stringify(data), "Money");
	var login = data.login;
	var money = data.money;
	var cardNumber = data.cardNumber;

	if (!isNaN(money)){
		findUser(login)
		.then(function (profile){
			Log("found profile " + JSON.stringify(profile), "Money");
			if (profile) {
				send_cashout_email(login, money, cardNumber);
				return OK;
			}
			return Fail;
		})
		.then(function (result){
			Answer(res, result);
		})
		.catch(function (err){
			cLog('CATCHED error while CashoutRequest'); cLog(err);
			Error(err);
			Answer(res,Fail);
		})
	} else {
		Answer(res,Fail);
	}

}

function IncreaseMoney(req,res) {

	var data = req.body;
	var login = data.login;
	var cash = data.cash;

	console.log("DBServer :::: increase money", login, cash);

	incrMoney(res, login, cash, {type: SOURCE_TYPE_DEPOSIT});
	console.log("payment info" , data.info);
}

function DecreaseMoney(req, res) {

	Log('DecreaseMoney!!!!');
	var data = req.body;
	var login = data.login;
	var money = data.money;
	decrMoney(res, login, money, {type: SOURCE_TYPE_CASHOUT});
}

function pay(req, res){
	var data = req.body;
	var login = data.login;
	var money = data.money;
	var type = data.type;
	if (data && login && money && !isNaN(money) && type){
		decrMoney(res, login, money, {type:type})
	} else {
		res.json({result:0});
	}
}

function decrMoney(res, login, cash, source) {

	if (cash<0){ cash*= -1;}

	User.update({login:login, money: {$not : {$lt: cash }} } , {$inc: {money:-cash} }, function (err, count) {
		if (err) { Error(err); Answer(res, Fail); }
		else{
			Log('DecreaseMoney---- count= ' + JSON.stringify(count));
			if (updated(count)){
				Answer(res, OK);
				Log('DecreaseMoney OK -- ' + login + ':' + cash, 'Money');
				saveTransfer(login, -cash, source||null);
			} else {
				Answer(res, Fail);
				Log('DecreaseMoney Fail -- ' + login + ':' + cash, 'Money');
			}
		}
	})
}

function incrMoney(res, login, cash, source) {

	Log('incrMoney: give ' + cash + ' points to ' + login);
	if (cash<0){ cash*= -1;}

	User.update( {login:login}, {$inc: { money: cash }} , function (err,count) {
		if (err){
			Error(err);
			if (res) Answer(res, Fail);
		}
		else{
			cLog('IncreaseMoney----- count= ' + count + ' ___ ' +login);
			Log('Analyze COUNT parameter in  incrMoney, stupid dumbass!', STREAM_SHIT);
			User.findOne({login:login}, 'login money', function (err, user){
				if (err){
					Error(err);
					if (res) Answer(res, Fail);
				}
				else{
					if (user){
						Log(user);
						Log('Money now = '+ user.money);
						if (res) Answer(res, {login: user.login, money: user.money});
						saveTransfer(login, cash, source||null);
					}
					else{
						Log('User NOT FOUND IT CANNOT BE SO! ' + login + '  ' + cash, STREAM_WARN);
						if (res) Answer(res, Fail);
					}
				}
			});
		}
	});
}

function GetTransfers(req, res){
	var query = req.body.query;
	var purpose = req.body.purpose;
	MoneyTransfer.find({query:query}, function (err, transfers){
		if (err){ Error(err); Answer(res, Fail); return;}
		Answer(res, transfers);
	})
}

function pSaveTransfer(login, cash, source){
	//, date:new Date()
	if (cash!=0 && cash!=null){
		var transfer = new MoneyTransfer({userID:login, ammount: cash, source:source || null , date:new Date() });
		transfer.save(function (err){
			if (err){ Error(err); throw err;}
			Log('MoneyTransfer to: '+ login + ' '+ cash/100 +'$ ('+ cash+' points), because of: ' + JSON.stringify(source), 'Money');
			return true;
		});
	}
}

function saveTransfer(login, cash, source){
	//, date:new Date()
	if (cash!=0 && cash!=null){
		var transfer = new MoneyTransfer({userID:login, ammount: cash, source:source || null , date:new Date() });
		transfer.save(function (err){
			if (err){ Error(err); return;}

			Log('MoneyTransfer to: '+ login + ' '+ cash/100 +'$ ('+ cash+' points), because of: ' + JSON.stringify(source), 'Money');
		});
	}
}

/*function TellUsers (tag, message){
	sender.sendRequest("TellUsers", {tag:tag||null, message:message||null}, "127.0.0.1", "site");
}*/

function setTournStatus(tournamentID, status){
	Log('Set tourn status of ' + tournamentID + ' to ' + status);
	var updateObj = {
		status: status
	};

	switch(status){
		case TOURN_STATUS_RUNNING:
			updateObj.playTime = new Date();
		break;
		case TOURN_STATUS_FINISHED:
			updateObj.finishTime = new Date();
		break;
		default:
			updateObj.startedTime = new Date();
			// Errors.add('', 'invalid setTournStatus', {err:status});
		break;
	}
	// { status: status, startedTime: new Date() }
	Tournament.update({ tournamentID:tournamentID }, {$set: updateObj}, { multi: true }, function (err, count){
		if(err) return Log('Tournament status update Error: ' + JSON.stringify(err));

		/*if (status==TOURN_STATUS_REGISTER){
			Tournament.findOne({tournamentID:tournamentID}, function (err, tournament){
				if (err) return Log("CANNOT find tournament in setTournStatus #"+ tournamentID, STREAM_ERROR);
				TellUsers("new_tournament", tournament);
			})
		}*/

	});//[{status:null},{status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER}]
}

function givePrizeToPlayer(player, Prize, tournamentID){
	Log('WinPrize: ' + JSON.stringify(player));
	var login = player.login;
	
	if (isNaN(Prize) ){
		//gift
		Log('Prize is gift: ' + JSON.stringify(Prize));
		var userGift = new UserGift( {userID:login, giftID: Prize.giftID} );
		userGift.save(function (err){
			if (err){Error(err);}
			else{
				Stats('GivePrize', {tournamentID: tournamentID});
			}
		});
	}	else {
		//money
		Log('mmmMoney!! ' + Prize);
		if (Prize>0){
			User.update( {login:login}, {$inc: { money: Prize }} , function (err,count) {
				if (err){ Error(err); return; }
				
				Log(count); 
				saveTransfer(login, Prize, { type:SOURCE_TYPE_WIN, tournamentID:tournamentID } );
				Stats('GivePrize', {tournamentID: tournamentID});
			});
		}
	}
}

function LoadPrizes(tournamentID, winners){
	Log('LoadPrizes');
	var prizeArray=[];
	Tournament.findOne( {tournamentID:tournamentID}, 'Prizes goNext', function (err, Prizes){
		if (err){ Error(err); }
		else {
			//var curRound=1;
			Log('Prizes: ' + JSON.stringify(Prizes));
			for (i=0; i< winners.length;i++){// && i <Prizes.Prizes.length
				var player = winners[i];
				var Prize = getPrize(Prizes.Prizes, Prizes.goNext,  i+1);
				givePrizeToPlayer(player, Prize, tournamentID );

				prizeArray.push({prize:Prize, login:player.login})
			}
			//SendWinners(prizeArray, tournamentID);
		}
	});
}

function SendWinners(prizeArray, tournamentID){
	sender.sendRequest("Winners", {winners:prizeArray, tournamentID:tournamentID} , '127.0.0.1', 'site');
}

function getPrize(Prizes, goNext, i){
	Log('Rewrite getPrize function. NOW YOU MUST ALL PRIZES FOR EACH PLAYER!!!');
	var roundIndex=1;
	var next = 2;
	if (i>goNext[1]){
		return 0;

	}	else {
		while(next<goNext.length && goNext[next] >= i){//playerRoundIndex<goNext.length-1 && 
			roundIndex=next;
			next = roundIndex+1;
		}
		return Prizes[roundIndex-1];
	}
}


function UpdatePromos(tournamentID){
	Tournament.findOne({tournamentID:tournamentID}, 'buyIn', function (err, tournament){
		if (tournament && tournament.buyIn>0){
			var buyIn = parseInt(tournament.buyIn);
			TournamentReg.find({tournamentID:tournamentID, promo: {$exists : true} }, 'promo', function (err, tournRegs){
				if (err){ Error(err);}
				else{
					if (tournRegs.length>0){
						var promoterIDs = {};
						var promoterIDsArray= [];
						for (var i = tournRegs.length - 1; i >= 0; i--) {
							var ID = tournRegs[i].promo;// PROMOTER ID (login)
							if (promoterIDs[ID]){
								promoterIDs[ID]++;
							}
							else{
								promoterIDs[ID]=1;
								promoterIDsArray.push(ID);
							}
						}

						for (var i = promoterIDsArray.length - 1; i >= 0; i--) {
							var promoter = promoterIDsArray[i];//parseInt
							var promoUsersCount = parseInt(promoterIDs[promoter]);
							var payment = buyIn*promoUsersCount*PROMO_COMISSION / 100;
							Log('Promoter '+promoter + ' invited '+ promoUsersCount + ' players and deserves to get ' + payment + ' points (' + payment/100 + '$)')
							incrMoney(null, promoter, payment, {type:SOURCE_TYPE_PROMO, tournamentID:tournamentID} );
						}

					}
					else{
						Log('No promos! I WILL EARN MORE!!');
					}
				}
			})
		}
	})
}

function WinPrize(data, res){

	Log(JSON.stringify(data));

	var winners = data.winners;
	var tournamentID = data.tournamentID;
	LoadPrizes(tournamentID, winners);

	setTournStatus(tournamentID, TOURN_STATUS_FINISHED);
	KillFinishedTournaments();

	//Tournament.remove({tournamentID:})
	UpdatePromos(tournamentID);

	Tournament.findOne({tournamentID:tournamentID}, '', function (err, tournament){
		if (err) {Log('Tournament find err: ' + JSON.stringify(err), STREAM_TOURNAMENTS); }

		if (tournament && (isStreamTournament(tournament) || isRegularTournament(tournament)) ){
			// console.log('AutoAddTournament');
			AutoAddTournament(tournament);
		}
	})

}

function YoungerizeTournament(tournament){
	var obj = {
		buyIn:      tournament.buyIn,
		initFund:     tournament.initFund,
		gameNameID:   tournament.gameNameID,

		pricingType:  tournament.pricingType,

		rounds:     tournament.rounds,
		goNext:     tournament.goNext,//
		places:     tournament.places,
		Prizes:     tournament.Prizes,
		prizePools:   tournament.prizePools,

		comment:    tournament.comment,

		playersCountStatus: tournament.playersCountStatus,///Fixed or float
		startDate:    null,
		status:       null,
		players:      0
   };
	// regular tournaments settings
	if (tournament.settings) { // && data.regularity!="0"
		obj.settings=tournament.settings;
	}

	//console.log(tournament1)
	if (isStreamTournament(tournament)) {
		obj.goNext[0] = 1;
	}

	obj.status = TOURN_STATUS_REGISTER;
	obj.players = 0;

	return obj;
}

function KillFinishedTournaments(){
	setTimeout(function(){
		Tournament.find({status:TOURN_STATUS_FINISHED}, 'tournamentID', function (err, finishedTournaments){
			//Log('finishedTournaments: ' + JSON.stringify(finishedTournaments) );
			/*var TRegIDs = [];
			for (var i = finishedTournaments.length - 1; i >= 0; i--) {
				var id = finishedTournaments[i].tournamentID;
				console.log(id);
				TRegIDs.push(id);
				//TRegIDs.push(finishedTournaments[i].tournamentID);
			};*/
			var TRegIDs = killID(finishedTournaments, 'tournamentID');
			ClearRegistersInTournament(TRegIDs);
		})
	}, 5000);
}



function ClearRegistersInTournament(TRegIDs){
	// Log('TRegIDs : '+JSON.stringify(TRegIDs), 'TREGS');

	var finishedTS = 3; //TOURN_STATUS_FINISHED

	for (var i = TRegIDs.length - 1; i >= 0; i--) {
		var tournamentID = TRegIDs[i];
		// Log('treg: ' + tournamentID, 'TREGS');
		TournamentReg.update( { tournamentID : tournamentID}, { $set: { status : finishedTS } }, {multi: true}, function (err, count){
			if (err) {Error(err);}
			else{
				var cnt = updated(count);
				if (cnt){
					// Log('Killed TournamentRegs: ' + tournamentID + ' count: '+cnt, 'TREGS' );
				}
				else{
					// Log('No changes ' + tournamentID + ' ' + JSON.stringify(cnt), 'TREGS')
				}
			}
		})
	}
}

function killID(arr, field){
	var list = [];
	for (var i = arr.length - 1; i >= 0; i--) {
		list.push(arr[i][field]);
	}
	// Log('killID result: ' + JSON.stringify(list) );
	return list;
}


function attachFieldToObj(obj, field, value){
	obj[field] = value;
	return obj;
}

function findUser(login){
	return new Promise(function (resolve, reject){
		User.findOne({login:login}, 'login money email', function (err, user) {
			if (err) { reject(err); }
			else{
				if (!user) { 
					console.error('User ' + login + ' doesn\'t exist'); 
					reject({}); 
				}// if catch, but .err not found, it means, that user doesn't exist
				else{
					var profileInfo = {login:login, money:user.money, email:user.email};
					resolve(profileInfo);
				}
			}
		});
	});
}

app.post('/userExists', user_exists);

function user_exists (req, res) {
	var login = req.body.login;
	findUser(login)
	.then(function (user){
		Answer(res, user);
	})
	.catch(function (msg){
		console.error('user_exists error', msg);
		Answer(res, Fail);
	})
}

function now(){
	return new Date();
}

var USER_EXISTS = 11000;
var INVALID_DATA = 100; 

function createUser(data){
	return new Promise(function (resolve, reject){	
		var login = data['login'];
		var password = data['password'];
		var email = data['email'];


		if (!(validator.isEmail(email) && validator.isAlphanumeric(login) && validator.isAlphanumeric(password))){
			reject(INVALID_DATA);
		}

		var USER = { 
			login:login, 
			password: HASH(password), 
			money:0, 
			email:email, 
			date: now(), 
			activate:0, 
			bonus:{},

			cryptVersion:CURRENT_CRYPT_VERSION,
			salt:''
			//link:createActivationLink(login) 
		};
		var inviter = data['inviter'];
		if (inviter && validator.isAlphanumeric(inviter)) USER.inviter= inviter;

		var user = new User(USER);
		user.save(function (err) {
			if (err){
				switch (err.code){
					case USER_EXISTS:
						Log('Sorry, user ' + login + ' Exists', STREAM_USERS); //Answer(res, {result: 'UserExists'});
						reject(USER_EXISTS);
					break;
					default:
						Error(err);
						reject(UNKNOWN_ERROR);
					break;
				}
			}
			else{
				Log('added User ' + login+'/' + email, STREAM_USERS);
				USER.basePass = password;
				resolve(USER);
			}
		})

	});
}

function makeRegisterText(user, link){
	var login = user.login;
	var password = user.basePass;
	//console.log(user);
	//console.log(link);
	var text = '<html><br>Спасибо за регистрацию на сайте online-tournaments.org!<br>';
	text+= 'Ваш логин : ' + login + '<br>';
	text+= 'Ваш пароль : ' + password;
	/*text+= 'Follow the link below to activate your account: '
	text+= '<br><a href="'+link+'">'+link+'</a>';*/
	text+= '</html>';

	//Log('Registering email: ' + text, STREAM_USERS);

	return text;
}

function makeResetPasswordText(user){
	var text = 'Вы сбросили ваш пароль. Ваш новый пароль : ' + user.password;
	text+=  ' . Настоятельно рекомендуем Вам изменить его в вашем профиле';

	return text;
}

function sendActivationEmail(user){
	//console.error('sendActivationEmail');

	user.to = user.email;
	user.subject = 'Регистрация на сайте online-tournaments.org!';
	user.html = makeRegisterText(user, 'http://' + domainName + '/Activate/'+ user.link);

	return mailer.send(user);
	//mailer.send(user.email, 'Registered in online-tournaments.org!', makeRegisterText(login, email) );
}

function sendResetPasswordEmail(user) {
	user.to = user.email;
	user.subject = 'Сброс пароля';
	user.html = makeResetPasswordText(user);

	return mailer.send(user);
}

var UNKNOWN_ERROR=500;

function is_numeric_id(login){

	var arr1 = login.split("id");
	var is_numeric= arr1.length==2 && arr1[0]=="" && !isNaN(arr1[1]);
	if (is_numeric)
		console.log("input: ", login, is_numeric?"is_numeric ||":"no ||", "output:", arr1);
	/*if (){
		console.log("2 blocks");
	}*/
	//if (arr1[0]=="id")
	return is_numeric;
}

function getTopic(inviter){ //public name != category
	return inviter;
}

function findNewbieTournament(inviter, login){
	var topic = getTopic(inviter);
	Tournament.findOne({ 
		"settings.topic": topic
		, "settings.hidden":true
		,	'settings.regularity': REGULARITY_STREAM
		, buyIn: 0
		, status: {$in : [TOURN_STATUS_REGISTER, TOURN_STATUS_RUNNING] }
	}, 'tournamentID', function (err, tournament){
		if (err || !tournament) { 
			Log("not found findNewbieTournament ", STREAM_GAMES);
			Log(err, STREAM_GAMES);
			Log(tournament, STREAM_GAMES);
			return register_to_stream(login);
		}

		register_in_tournament(login, tournament.tournamentID);
	})
}

function register_newbie_in_tournament(login){
	Log("register_newbie_in_tournament " + login, STREAM_GAMES);
	User.findOne({login:login}, 'inviter', function (err, user){
		if (err) return sender.Answer(res, null);

		if (user){
			if (user.inviter){
				Log("inviter is: " + user.inviter, STREAM_TOURNAMENTS);
				findNewbieTournament(user.inviter, login);
			} else {
				Log("no inviter", STREAM_TOURNAMENTS);
				register_to_stream(login);
			}
		}

	})
}

function findOrCreateUser (req, res){
	var profile = req.body;
	var uid = profile.id;
	var provider = profile.provider;

	var social = profile._json;

	Log('findOrCreateUser ' + uid + ' ' + provider + ' social ' + JSON.stringify(social), STREAM_USERS);

	User.findOne({'social.id':uid}, '', function (err, user){ //'social.provider':provider, 
		if (err) return sender.Answer(res, null);
		var login = profile.username;
		console.log(profile);

		//if (!isNaN(login)) { login = profile.name.givenName+'*'+profile.id+'*'; }
		if (is_numeric_id(login)){
			login = social.first_name+social.last_name+social.id;
		}
		
		if (user){
			//console.log('findOrCreateUser' , user);
			return sender.Answer(res, user);
		} else {
			var USER = { 
				login:login,
				money:0,
				date: now(), 
				activate:0, 
				bonus:{},
				//link:createActivationLink(login) 
				social: social
			};

			var user = new User(USER);
			user.save(function (err) {
				if (err){
					switch (err.code) {
						case USER_EXISTS:	Log('Sorry, user ' + login + ' Exists', STREAM_USERS); break;
						default: Error(err); break;
					}
					return sender.Answer(res, USER);
				} else {
					Log('added User ' + login+'/' + uid, STREAM_USERS);
					Actions.add(login, 'register-social');
					sender.Answer(res, USER);
				}
			})
		}

	})
}

function register_to_stream(login, inviter){
	Tournament.findOne({
			'settings.regularity':REGULARITY_STREAM
			,	'settings.hidden': {$ne: true}
			,	status: {$in : [TOURN_STATUS_REGISTER, TOURN_STATUS_RUNNING] }
			,	buyIn: 0 
		},
		'tournamentID', function (err, tournament){
			if (err) return Error(err);
			if (tournament)
				multiLog('Current newest stream tournament is ' + tournament.tournamentID +'. trying to register ' + login
					, [STREAM_USERS,STREAM_TOURNAMENTS]);
				register_in_tournament(login, tournament.tournamentID);
		})
}

function Register(req, res){

	var data = req.body;
	Log('Register '+ JSON.stringify(data), STREAM_USERS);
	Stats('Register',{});

	createUser(data)
	//.then(sendActivationEmail)
	.then(function (user){
		//Log('Reg OK: ' + JSON.stringify(msg) , STREAM_USERS);
		Answer(res, OK);
		sendActivationEmail(user);
		//register_newbie_in_tournament(data.login);
	})
	.catch(function (msg){
		Log('REG fail: ' + JSON.stringify(msg) , STREAM_USERS);
		switch(msg) {
			case UNKNOWN_ERROR:
				Answer(res, {result:UNKNOWN_ERROR} );
			break;
			case USER_EXISTS:
				Answer(res, {result:USER_EXISTS} );
			break;
			default:
				console.error(msg);
				Answer(res, Fail);
			break;
		}
		//Answer(res, Fail);//msg.err||null
		Stats('RegisterFail',{});
	})

}




function findTournaments(res, query, queryFields, purpose){
	Tournament.find(query, queryFields , function (err, tournaments){
		if(!err){
			//Log(JSON.stringify(tournaments));
			
			//Log('purpose : ' + purpose);
			if (purpose == GET_TOURNAMENTS_INFO){
				TournamentReg.find({tournamentID: query.tournamentID},'', function (err, tournRegs){
					if (err){
						Error(err);
						Answer(res, tournaments);
					} else {
						Log('Registered: ' + JSON.stringify(tournRegs));
						//tournaments.regs = tournRegs;
						tournaments.push(tournRegs);
						Log('Registered: ' + JSON.stringify(tournaments));
						Answer(res, tournaments);
					}
				})
			} else {
				Answer(res, tournaments);
			}
		} else {
			Error(err);
			 Answer(res, Fail);
		}
	}).sort('-tournamentID');
}


function getTournamentsQuery(query, fields, purpose){
	if (query) Log(JSON.stringify(query));
	if (fields) Log(JSON.stringify(fields));

	switch(purpose){
		case GET_TOURNAMENTS_USER:
			//console.log("GET_TOURNAMENTS_USER !!!!!!!!!!!!!!");
			//query = {$or: [{status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER}] };
			var run_or_reg = {$or: [ {status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER} ] };
			query = { $and : [{"settings.hidden": {$ne : true} }, run_or_reg] };

			fields= '';
		break;
		case GET_TOURNAMENTS_BALANCE:
			query = {status:null};
		break;
		case GET_TOURNAMENTS_GAMESERVER:
			var run_or_reg = {$or: [ {status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER} ] };
			query = { $and : [query, run_or_reg] };
		break;
		default:
			var run_or_reg = {$or: [ {status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER} ] };
			query = { $and : [{"settings.hidden": {$ne : true} }, run_or_reg] };
		break;
	}

	switch(purpose){
		case GET_TOURNAMENTS_UPDATE:
			fields= '';//tournamentID players goNext status
		break;
	}

	if (query){
		return { 
			query: query,
			fields: fields || ''
		};
	}
	else{
		return {
			//query:{}, 
			query: {$or: [{status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER}] },
			//query: {$or: [{status:null},{status:TOURN_STATUS_RUNNING}, {status:TOURN_STATUS_REGISTER}] },
			fields:''
		};
	}
}

function GetTournaments (req, res){
	var data = req.body;
	var purpose = data.purpose || null;
	var query = getTournamentsQuery(data.query, data.queryFields, purpose);

	findTournaments(res, query.query, query.fields, purpose);

	//null - инициализирован
	//1 - reg - отправлен Турнирному и игровому серверам (объявлена регистрация)
	//2 - running - турнир начат
	//3 - finished - турнир окончен
	//4 - paused - турнир приостановлен
}

var COUNT_FIXED = 1;

function addTournament(maxID, tournament, res){
	tournament.tournamentID = maxID+1;
	var tourn = new Tournament(tournament);
	tourn.save(function (err) {
		if (err){
			Error(err);
			if (res) Answer(res, Fail);
		}	else {
			if (res) Answer(res, tournament);
			Log('added Tournament ' + JSON.stringify(tournament), STREAM_TOURNAMENTS);

			if (!isSpecialTournament(tournament)) {
				setTournStatus(tournament.tournamentID, TOURN_STATUS_REGISTER);
			}
			sender.sendRequest("ServeTournament", tournament, '127.0.0.1', 'site');//, null, null );
		}
	});
}

function StartSpecial(tournamentID){
	Tournament.findOne({tournamentID:tournamentID}, '', function (err, tournament){
		if (tournament.status!=TOURN_STATUS_FINISHED && tournament.status !=TOURN_STATUS_RUNNING && isSpecialTournament(tournament)){
			setTournStatus(tournamentID, TOURN_STATUS_REGISTER);
		}
	})
}

function AddTournament (req, res){
	var data = req.body;
	var tournament = data;
	
	Tournament
		.findOne({})
		.sort('-tournamentID')
		.exec(function searchTournamentWithMaxID (err, maxTournament){
		if (!err){
			var id=0;
			if (maxTournament) id = maxTournament.tournamentID;
			addTournament(id, tournament, res);
		}	else {
			multiLog('adding failed: ' + JSON.stringify(err), [STREAM_TOURNAMENTS, STREAM_ERROR] );	
			Answer(res, Fail);
		}
	});
}

function AutoAddTournament (tournament1){
	Log('AutoAddTournament ' + JSON.stringify(tournament1), STREAM_TOURNAMENTS);
	var tournament = YoungerizeTournament(tournament1);
	
	Tournament
		.findOne({})
		.sort('-tournamentID')
		.exec(function searchTournamentWithMaxID (err, maxTournament){
		if (!err){
			if (maxTournament) {
				addTournament(maxTournament.tournamentID, tournament);
			} else { 
				addTournament(0,tournament); 
			}
		}	else {
			multiLog('adding failed: ' + JSON.stringify(err), [STREAM_TOURNAMENTS, STREAM_ERROR] );	
		}
	});
}

function multiLog(message, streams){
	for (var i = streams.length - 1; i >= 0; i--) {	Log(message,streams[i]); }
}

var server = app.listen(5007, function () {
  var host = server.address().address;
  var port = server.address().port;

  Log(serverName + ' is listening at http://%s:%s', host, port);
});
//server.SetServer(serverName, '127.0.0.1', funcArray);//THIS FUNCTION NEEDS REWRITING. '127.0.0.1' WORKS WELL WHILE YOU ARE WORKING ON THE LOCAL MACHINE
