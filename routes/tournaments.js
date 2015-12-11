var express = require('express');
var router = express.Router();

var helper = require('../helpers/helper');
var log = helper.log;
var Promise = require('bluebird');

//var Users = require('../models/users')

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/
var Tournaments = require('../models/tournaments');



//module.exports = function(app, AsyncRender, Answer, sender, Log, proxy){
/*
var Fail = { result:'fail'};

var PRICE_FREE = 4;
var PRICE_TRAINING = 5;

var PRICE_GUARANTEED = 3;
var PRICE_NO_EXTRA_FUND = 2;
var PRICE_CUSTOM = 1;  //

var COUNT_FIXED = 1;
var COUNT_FLOATING = 2;

var strLog = Log;
//var Answer = sender.Answer;

	router.get('/AddTournament', function (req, res){
	  res.render('AddTournament');
	});

	router.post('/AddTournament', AddTournament);
	
  function AddTournament(req, res){
	  var data = req.body;
	  
	  if (!data){ 
	  	Answer(res, Fail); 
	  	return; 
	  }

    strLog('Incoming tournament : ' +JSON.stringify(data));
    var buyIn = parseInt(data.buyIn);
    var rounds = parseInt(data.rounds);
    var gameNameID = parseInt(data.gameNameID);
    var GoNext = data.goNext?data.goNext.split(" ") : [];
    var Prizes = data.Prizes.split(" ");
    var prizes = [];
    var goNext = [];
    strLog(JSON.stringify(Prizes));
    //convert array of strings to array of objects
    for (var i = 0; i < Prizes.length - 1; i++) {
      if (isNaN(Prizes[i]) ){
        if (Prizes[i].length>0){
          prizes.push({giftID:Prizes[i]})
        }
        else{
          strLog('Prize[i] is null. Current prize is: ' + Prizes[i]);
          Answer(res, Fail);
          return;
        }
      }
      else{
        prizes.push( parseInt(Prizes[i]) );
      }
    };

    for (var i=0; i< GoNext.length - 1; ++i){
      var num = parseInt(GoNext[i]);
      if (isNaN(num)){
        strLog('goNext num parseInt error! ');
        strLog(GoNext);
        Answer(res, Fail);
        return;
      }
      else{
        goNext.push(num);
      }
    }

    strLog('splitted prizes: ' + JSON.stringify(prizes) );
    strLog('goNext.length:' + goNext.length);
    strLog(JSON.stringify(goNext));
    //strLog('')
    if (buyIn>=0 && rounds && gameNameID){
      var obj = {
        buyIn:      buyIn,
        initFund:     0,
        gameNameID:   gameNameID,

        pricingType:  PRICE_NO_EXTRA_FUND,

        rounds:     rounds,
        goNext:     goNext.length>0 ? goNext : [2,1],//
            places:     [1],
          Prizes:     prizes.length>0 ? prizes: [{giftID:'5609b7988b659cb7194c78c6'}],
            prizePools:   [1],

        comment:    'Yo',
        
        playersCountStatus: COUNT_FIXED,///Fixed or float
          startDate:    null,
          status:     null, 
          players:    0
      }
      AsyncRender('DBServer', 'AddTournament', res, {renderPage:'AddTournament'}, obj);
      //sender.sendRequest('AddTournament', obj, '127.0.0.1', 'DBServer', res, sender.proxy);
    }
    else{
      strLog('Invalid data comming while adding tournament: buyIn: ' + buyIn + ' rounds: ' + rounds + ' gameNameID: ' + gameNameID, 'WARN');
      sender.Answer(res, Fail);
    }
	}

	router.post('/GetTournamentAddress', function (req, res){
		Log('tournaments.js ... tID = ' + req.body.tournamentID, 'Tournaments');
		AsyncRender('DBServer', 'GetTournamentAddress', res, {}, {tournamentID: req.body.tournamentID} );
	})

	router.post('/FinishGame', FinishGame);
	function FinishGame(req, res){
		var data = req.body;
    console.error(data);

		sender.Answer(res, {result:'OK', message:'FinishGame'} );
		sender.sendRequest("FinishGame", data, '127.0.0.1', 'DBServer', null, sender.printer);
	}


  router.post('/ServeTournament', ServeTournament);
  function ServeTournament (req, res){
    var data = req.body;
    console.log('ServeTournament ... site.tournaments');
    strLog("ServeTournament ... site.tournaments ", 'Tournaments');
    //strLog(JSON.stringify(data));//['tournamentStructure']);

    var tournament = data;

    sender.sendRequest("ServeTournament", tournament, '127.0.0.1', 'GameFrontendServer', res, proxy);
  }



  const GET_TOURNAMENTS_INFO = 4;

  router.get('/TournamentInfo', function (req, res){
    var data = req.body;
    data.query = {tournamentID:req.query.tID};
    data.queryFields = 'tournamentID buyIn goNext gameNameID Prizes players status';
    data.purpose = GET_TOURNAMENTS_INFO;  

    AsyncRender('DBServer', 'GetTournaments', res, {renderPage:'TournamentInfo'}, data);
  });*/
  /*router.all('/StartTournament', function (req, res){
    //console.log(req.url);
    Log('StartTournament', 'ASD');
    console.log('Site starts tournament');
    var data = req.body;
    //console.log(req.body);

    //
    sender.sendRequest("StartTournament", data, '127.0.0.1', 'GameFrontendServer', null, sender.printer);//sender.printer
    //

    //io.emit('StartTournament', {tournamentID : data.tournamentID, port:data.port, host:data.host, logins : data.logins});//+req.body.tournamentID
    res.end();
  });*/

  function Render(res, page, data){
    res.render(page, {msg:data||null});
  }

  function InternalError(res){
    res.status(500);
  }

  router.all('/', function (req, res){
    log('get tournaments');
    Tournaments.get_tournaments_for_user()
    .then(function(tournaments){
      log('tournaments');
      //Render(res, 'GetTournaments', tournaments);
      res.json(tournaments);
    })
    .catch(function(err){
      log('get Tournaments error ' + ' Tournaments');
      log(err);
      InternalError(res);
    })
    //AsyncRender('DBServer', 'GetTournaments', res, {renderPage:'GetTournaments'}, data);
  });

module.exports = router;