module.exports = function(app, AsyncRender, Answer, sender, strLog, isAuthenticated, getLogin){
  app.post('/Admin', Admin);
  function Admin(req, res){
    var command = req.body.command || '';
    switch(command){
      case 'TournamentsRunning': TournamentsRunning(res); break;
      case 'stopTournament': stopTournament(res, req.body.tournamentID); break;
      case 'runTournament': runTournament(res, req.body.tournamentID); break;
      case 'Tournaments': GetTournamentsFromTS(res); break;
      case 'Stop': StopServer(res, req.body.serverName); break;

      case 'GetGameFromGameServer': GetGameFromGameServer(res, req.body.gameNameID); break;
      default: sender.Answer(res, {result:'Unknown command ' + command}); break;
    }
  }

  function GetGameFromGameServer(res, gameNameID){
    var servName = gameNameID;
    AsyncRender(servName, 'GetGames', res);
  }

  function GetTournamentsFromTS(res){
    sender.sendRequest('Tournaments', {}, 'localhost', 'TournamentServer', res, sender.Proxy);
  }

  function stopTournament(res, tournamentID){
    sender.sendRequest('StopTournament', {tournamentID:tournamentID}, 'localhost', 'TournamentServer', res, sender.Proxy);

    strLog('FrontendServer StopTournament :::'+tournamentID, 'Manual');
    sender.sendRequest("StopTournament", {tournamentID:tournamentID}, '127.0.0.1', 'GameFrontendServer', null, sender.printer);
  }

  function runTournament(res, tournamentID){
   sender.sendRequest('RunTournament', {tournamentID:tournamentID}, 'localhost', 'TournamentServer', res, sender.Proxy); 
  }

  function TournamentsRunning(res){
    sender.sendRequest('Running', {}, 'localhost', 'TournamentServer', res, sender.Proxy);
  }
  app.get('/Admin', function (req, res){
    //res.sendFile(__dirname + '/SpecLogs.html', {topic:'Forever'});
    res.render('AdminPanel', {msg:'hola!'});
      return;
    if (isAuthenticated(req) && getLogin(req) =='Alvaro_Fernandez'){
      res.render('AdminPanel', {msg:'hola!'});
      return;
    }
    res.send(404);

  });

  app.get('/Users' , function (req, res){
    /*if(req.session.login) {
      console.log('Saved login is: ' + req.session.login);
      //res.write('Last page was: ' + req.session.user + '. ');
    }
    console.log(req.params);
    if (req.query.login){
      console.log(req.query);
      console.log('Getting login: ' + req.query.login);
      req.session.login = req.query.login;

    }*/
    
    var data = req.body;
    data.query = {};//tournamentID:req.query.tID};
    data.queryFields = 'login money';

    //siteAnswer(res, 'GetUsers', data, 'Users');//, {login: req.session.login?req.session.login:''} );//Users
    
    AsyncRender("DBServer", 'GetUsers', res, {renderPage:'Users'}, data);
  });

}