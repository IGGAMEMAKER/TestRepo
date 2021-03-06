module.exports = function(app, aux, SOCKET, io){
	var Teams = require('../models/teams');
	var Users = require('../models/users');

	var api = require('../helpers/api');

	var requestSender = require('../requestSender');
	var logger = console.log;

	var configs = require('../configs');

	// api calls

	// var join_team = function (login, teamname) {
	//
	// };

	app.get('/Team', aux.authenticated, function(req, res) {
		res.render('Team');
	});

	app.post('/Team', aux.authenticated, function(req, res) { // create team
		var name = req.body.name;
		// var login = req.login;
		var login = req.login;

		if (!name) {
			logger('invalid data', team);
			return res.render('Team');
		}

		var createTeam = function (profile){
			if (profile.team) throw 'joined_already';

			return Teams.add(name, login)
		};

		var joinTeam = function (result){
			logger('Team addition', result);
			return Users.joinTeam(login, name)
				.then(function (result) {
					logger('User joined', result);
					return result;
				})
		};

		var print = function (result){
			logger(result, '/Team POST', login);
			res.render('Team');
		};

		Users.profile(login) // check, if he joined team already
		.then(createTeam)
		.then(joinTeam)
		.then(print)
		.catch(print)
	});
	const TEAM_JOINED_TRUE = 1;
	const TEAM_JOINED_FALSE = 2;
	const TEAM_JOINED_ERR = 3;

	function unjoinTeam(player) {
		logger('unjoinTeam', player);
		Users.quitTeam(player.name);
	}

	function updateProfiles (object) {
		object.players.map(unjoinTeam);
		return object.result;
	};

	app.post('/api/teams/kick/:user/:teamname', aux.authenticated, function (req, res, next) {
		Teams.removePlayer(req.params.teamname, req.params.user, req.login)
			.then(function (result) {
				// return result;
				return Users.quitTeam(req.params.user);
			})
			.then(aux.setData(req, next))
			.catch(aux.errored)
	}, aux.std);

	// app.get('/api/teams/request/:teamname/:player', aux.authenticated, function (req, res, next) {
	// 	Teams.sendRequest(req.params.teamname, req.params.player)
	// 		.then(aux.setData(req, next))
	// 		.catch(aux.errored)
	// }, aux.std);

	app.get('/api/teams/removeById/:id', aux.isAdmin, function (req, res, next) {
		var id = req.params.id;

		Teams.removeById(id)
			.then(updateProfiles)
			.then(aux.setData(req, next))
			.catch(aux.errored)
	}, aux.std);

	app.get('/api/teams/left', aux.authenticated, function (req, res, next) {
		var login = req.login;

		Users.quitTeam(login)
			.then(aux.setData(req, next))
			.catch(aux.errored)
	}, aux.std);

	app.get('/api/teams/join/:teamname/:player', aux.isAdmin, function (req, res, next) {
		var login = req.params.player;
		var teamname = req.params.teamname;

		Users.joinTeam(login, teamname)
			.then(aux.setData(req, next))
			.catch(aux.errored)
	}, aux.std);

	app.post('/api/teams/divide', aux.authenticated, function (req, res) {
		var login = req.login;
		var print = function (result) {
			logger('/api/teams/divide', result);
			res.render('Teams');
		};

		Users.profile(login)
			.then(function (profile) {
				if (!profile.team) throw 'invalid request';

				return Teams.get(profile.team)
			})
			.then(function (team) {
				var isInTeam = false;
				var players = team.players;
				var teamname = team.name;

				players.forEach(function (player) {
					if (player.name === login) isInTeam = true;
				});

				if (!isInTeam) throw 'is not in team';
				logger('is in stream');
				var ammount = Math.floor(team.money / players.length);

				players.forEach(function (player) {
					Users.moneyIncrease(player.name, ammount);
				});

				return Teams.setMoney(teamname, team.money % players.length)
			})
			.then(print)
			.catch(print)
	});

	app.get('/api/teams/remove/:name', aux.isAdmin, function (req, res, next) {
		var name = req.params.name;

		Teams.removeByName(name)
			.then(updateProfiles)
			.then(aux.setData(req, next))
			.catch(aux.errored)
	}, aux.std);

	app.post('/api/teams/remove/:teamname', aux.authenticated, api('Teams', 'removeByName'));

	// app.post('/api/teams/remove/:teamname', aux.authenticated, function (req, res, next) {
	// 	var teamname = req.params.teamname;
  //
	// 	Teams.removeByName(teamname)
	// 		.then(updateProfiles)
	// 		.then()
	// }, aux.std);

	app.get('/api/teams/accept/:player/:teamname', aux.authenticated, function (req, res) {
		var player = req.params.player;
		var teamname = req.params.teamname;
		Users.profile(player)
			.then((profile) => {
				if (profile.team) throw 'joined';

				return Teams.join(teamname, player)
			})
			.then(function (result) {
				return Users.joinTeam(player, teamname)
			})
			.then(function (result) {
				res.json({ accepting: player, result: result });
			})
			.catch(function (err) {
				res.json({ accepting: player, err: err });
			})
	});

	app.get('/api/teams/', aux.authenticated, function(req, res) {
		var login = req.login;
		Users.profile(login)
		.then(function (profile){
			var team = profile.team;
			// logger('/api/teams/', login, profile);
			if (!team) throw 'no_team';

			return Teams.get(team)
		})
		.then(function (team){
			res.json({ joined: TEAM_JOINED_TRUE, team: team });
		})
		.catch(function (err){
			logger('errored', err, '/api/teams/', login);
			if (err=='no_team') {
				res.json({ joined: TEAM_JOINED_FALSE, team: null });
				return;
			}
			res.json({ joined: TEAM_JOINED_ERR, error:err, team: null })
		});
		// var team = {
		// 	name: 'КрутыеКексы',
		// 	players: [
		// 		{ name: 'Гага' },
		// 		{ name: 'Гага1' },
		// 		{ name: 'Гага2' },
		// 	],
		// 	captain: 'Гага',
		// 	money: 100,
		// 	settings: {},
		// }
		// res.json({ joined: true, team: team });
	});

	app.get('/api/teams/all', aux.isAdmin, api('Teams', 'all'));
	app.get('/Teams', api('Teams', 'all', 'Teams'));
};
