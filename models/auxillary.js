var Promise = require('bluebird');

var configs = require('../configs');
var helper = require('../helpers/helper');
var middlewares = require('../middlewares');

var log = helper.log;
var debug = helper.log;

var Fail = { result: 'fail' };
var OK = { result: 'OK' };

// var mongoose = require('mongoose');
// //mongoose.connect('mongodb://localhost/test');
log(configs.db);

var models = require('../models')(configs.db);
// var Tournament = models.Tournament;

// 

var mailsender = require('../helpers/mailchimp');

// 

var Actions = require('./actions');// models.Action;
var Errors = require('./errors');//models.Error;
var Stats = require('./statistics');//models.Statistic;

var Message = require('./message');

// AuxillarySpec
// writing logs
// log errors
// useful middlewares isAdmin, isAuthenticated ...
// counting stats
// useful functions : isUpdated, isRemoved


function isAuthenticated(req){ return (req.session && req.session.login); } // || req.user; 
function isNumeric(num) { return !isNaN(num); }
var io;
module.exports = {
	debug : debug
	,log : log

	,io: function(socket){
		io = socket;
	}

	,isAuthenticated : middlewares.authenticated
	,isAdmin : middlewares.isAdmin

	// ,attempt : Stats.attempt
	,clientside : function(login, auxillaries){
		// console.error('clientside', arguments)
		return Actions.add(login, 'clientside', auxillaries)
	}
	,clientsideError: function (login, auxillaries){
		return Errors.add(login, 'clientside', auxillaries)
	}
	,done : Actions.add
	,fail : Errors.add

	,notify : Message.notifications.personal
	
	,alert: function(login, type, data){
		return Message.notifications.personal(login, type, data)
		.then(function (result){
			io.forceTakingNews(login);
		})
	}

	,updated: helper.updated
	,removed: helper.removed

	,json : function (req, res){
		res.json({msg: req.data})
	}
	,raw : function (req, res){
		res.end(req.data);
	}
	,err : function (err, req, res, next){
		res.json({err: err})
	}
	,getLogin: function (req){
	  if (isAuthenticated(req)){
	    return req.session.login;
	  } else {
	    return 0;
	  }
	}

	// send message and page
	,answer : function (page){
		return function (req, res){
			res.render(page, { msg: req.data });
		}
	}
	,error: function (page, message, tag, code){
		return function (err, req, res, next){
			res.render(page, { msg:0, err:message, code:code||null })

			// write errors here
		}
	}
	,catcher : console.error


	// mail
	,mailLists: function(){
		return mailsender.list()
	}
	,mailUsers: function(){
		return mailsender.users()
	}
	,delivery: function(list, letters){
		for (var i = list.length - 1; i >= 0; i--) {
			var email = list[i];
			var letter = letters[i];
			mailsender.send(email, letter);
		};
	}

}