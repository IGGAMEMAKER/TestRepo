var gs = require('../gameModule');
var app = gs.app;
var games = gs.games;
var send = gs.SendToRoom;
var strLog = gs.strLog;
var getUID = gs.getUID;
var FinishGame = gs.FinishGame;

var respond = require('../middlewares/api-response');

var modelWrapper = require('../helpers/model-wrapper');

//var SendPeriod = UpdPeriod;
var NUMBER_OF_QUESTIONS = 6;

var questionDir = './frontend/games/Questions/';
var questionFolder = 'general';

var logger = require('../helpers/logger');

var fs = require('fs');

var configs = require('../configs');
var UpdPeriod = configs.quizQuestionPeriod;// || 4000;

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
mongoose.connect('mongodb://' + configs.db + '/test');

var random = require('mongoose-simple-random');
var Promise = require('bluebird');

const MODERATION_NONE = 0;
const MODERATION_REJECTED = 1;
const MODERATION_OK = 2;
const MODERATION_MODIFIED = 3;

var s = new mongoose.Schema({ 
	question: String, answers: Array, correct:Number,
	tournamentID: Number, topic:String,
	questionID: Number,
	language: String,

	moderation: Number, createdBy: String,
	date:Date
});

s.plugin(random);

var Question = mongoose.model('Question', s);

var Question2 = modelWrapper(Question);

var isModerator = (req, res, next) => {
	next();
};

var isAdmin = (req, res, next) => {
	next();
};

var isModeratorOrAdmin = (req, res, next) => {
	next();
};

var isPlayer = (req, res, next) => {
	next();
};

app.get('/updateQuestions', function (req, res){
	initializeQuestions();
	res.end('OK');
});

app.post('/offerQuestion', function (req, res){
	var obj = req.body;
	obj.moderation = MODERATION_NONE;
	obj.date = new Date();

	strLog('offerQuestion ' + JSON.stringify(obj), 'Games');

	AddQuestion(obj, res);
});

app.get('/questions', function (req, res){
	Question.find({ moderation: MODERATION_NONE }, function (err, questions){
		if (err) return res.json(err);

		//res.end(JSON.stringify(questions));
		res.render('newQuestions', { msg: questions });
	})
});

app.get('/questions/all', function (req, res){
	Question.find({}, function (err, questions){
		if (err) return res.json(err);

		//res.end(JSON.stringify(questions));
		res.render('newQuestions', { msg: questions });
	})
});

app.get('/questions/raw/:topic', function (req, res){
	var	topic = req.params.topic;
	var find = { moderation : { $in : [MODERATION_MODIFIED, MODERATION_OK] } };

	if (topic != 'default') {
		find.topic = topic;
	}

	Question.find(find, function (err, questions){
		if (err) return res.json(err);

		res.json({ msg: questions });
	})
});

app.get('/questions/raw', function (req, res){
	Question.find({}, function (err, questions){
		if (err) return res.json(err);

		//res.end(JSON.stringify(questions));
		res.json({ msg: questions });
	})
});

app.get('/questions/topic/:topic', function (req, res){
	var	topic = req.params.topic;
	Question.find({ topic: topic }, function (err, questions){
		if (err) return res.json(err);

		//res.end(JSON.stringify(questions));
		res.render('newQuestions', { msg: questions });
	})
});

app.get('/questions/set-tournament-id/:questionID/:tournamentID', isModerator, respond(req => {
	var questionID = req.params.questionID;
	var tournamentID = parseInt(req.params.tournamentID);

	if (isNaN(tournamentID)) throw 'invalid tournamentID';

	var obj = {};

	if (tournamentID === 0) {
		obj = {
			$unset: {
				tournamentID: 1
			}
		}
	} else {
		obj = {
			$set: {
				tournamentID
			}
		}
	}

	return Question2.update({ '_id': questionID }, obj);
}));

app.get('/editQuestion', function (req, res){
	var id = req.query.id;
	var question = req.query.question;
	var answer1 = req.query.answer1;
	var answer2 = req.query.answer2;
	var answer3 = req.query.answer3;
	var answer4 = req.query.answer4;

	var correct = req.query.correct;

	var msg = {
		question,
		answer1,
		answer2,
		answer3,
		answer4,
		correct,
		id
	};

	res.render('add_question', { msg });
});

app.get('/setTopic/:id/:topic', function (req, res){
	var id = req.params.id;
	var topic = req.params.topic;
	var obj;

	if (topic == 0) {
		obj = { $unset: { topic:"" } }
	} else {
		obj = { $set: { topic:topic } }
	}

	Question.update({ '_id': id }, obj, function (err, count){
		if (err) return res.json(err);

		return res.json(count);
	})
});

app.post('/editQuestion', function (req, res){
	var data = req.body;
	var id = req.query.id;
	var answers = [];

	answers.push(data.answer1);
	answers.push(data.answer2);
	answers.push(data.answer3);
	answers.push(data.answer4);

	var obj = {
		question: data.question,
		answers: answers,
		correct: data.correct
	};
	
	Question.update({'_id':id}, {$set: obj}, function (err, count){
		if (err) return res.json(err);

		return res.json(count);
	})
});

app.get('/moderate/:id/:status', function (req, res){
	var id = req.params.id;
	var status = req.params.status;

	Question.update({ '_id': id }, { $set : { moderation: status } }, function (err, count){
		if (err) return res.json(err);

		return res.json(count);
	})
});

app.get('/AddQuestion', function (req, res){
	res.render('add_question');
});

app.post('/AddQuestion', function (req, res){

	var data = req.body;
	var answers=[];

	answers.push(data.answer1);
	answers.push(data.answer2);
	answers.push(data.answer3);
	answers.push(data.answer4);

	var obj = {
		question: data.question
		,	answers: answers
		,	correct: data.correct
		//,tournamentID: data.tournamentID
	};

	if (data.tournamentID) {
		obj.tournamentID = data.tournamentID;
	}
	if (data.topic) {
		obj.topic = data.topic;
	}
	
	AddQuestion(obj, res);
});

// app.get('/updateQuestions', function (req, res){
// 	/// iterate by topics (keys of questionBase) and fill questionBase
// })

var questionBase = {};

var topics = ['realmadrid', 'default'];

function loadTopics(){
	var obj = { 
		$group: {
			_id : "$topic"
		} 
	};
	Question.aggregate([obj], function (err, list){
		if (err) return logger.error('cannot load topics', err);

		if (list.length) {
			logger.debug(topics, list);
			topics = [];
			
			for (var i = list.length - 1; i >= 0; i--) {
				var topic = list[i]._id;
				topics.push(topic);
			}
			// topics = list;
			logger.debug(topics, list);
		}
	})
}

function initializeQuestions() {
	loadTopics();
	setTimeout(function (){
		for (var i = topics.length - 1; i >= 0; i--) {
			loadByTopic(topics[i]);
		}
	}, 3000);
}



initializeQuestions();

app.get('/topic/:topic', function (req, res){
	res.json({ msg: questionBase[req.params.topic] })
});

app.get('/questionBase', function (req, res){
	res.json({ msg: questionBase })
});

app.get('/switchToDefault', function (req, res){
	Question.update({ topic: { $exists: false } }, {$set: { topic: 'default'} }, { multi: true }, function (err, count){
		if (err) return res.json({ err: err});

		return res.json({ count: count })
	});
});

function loadQuestions(query, params, hard){
	return new Promise(function (resolve, reject){
		Question.find(query||{}, params||'', function (err, questions){
			if (err) return reject(err);

			if (hard && questions.length < 3) return reject('no questions');
			resolve(questions)
		})
	})
}

function AddQuestion(data, res){
	var question = new Question(data);

	question.save(function (err){
		if (err) {
			strLog('cannot save new question((( ' + JSON.stringify(err), 'Err');
			if (res) res.json({ result:'error', msg: err });
			return;
		}

		if (res) res.json({ result: 'ok', msg: 'question saved' });
		strLog('question saved!', 'Games');
	})
}


app.post('/Points', function (req, res){
	var data = req.body;
	var login = data.login;
	var gameID = data.gameID;

	if (games[gameID] && login && games[gameID].scores[login]){
		res.json({ points: games[gameID].scores[login] });
	} else {
		res.json({ points: 0 });
	}
});

function set_questions(questions, gameID){
	strLog('set_questions questions for ' + gameID + '   ' + JSON.stringify(questions), 'Games');

	games[gameID].questions = [];

	for (var i = questions.length - 1; i >= 0; i--) {
		var qst = questions[i];
		var question = qst.question;
		var answers = qst.answers;
		var correct = qst.correct;

		games[gameID].questions.push({ question, answers, correct });
	}
}

function add_question_to_list(gameID, qst){
	var question = qst.question;
	var answers = qst.answers;
	var correct = qst.correct;

	games[gameID].questions.push({ question, answers, correct });
}

function find_random_question(gameID, left, count, attempts){
	//var offset = Math.random()*count;
	//if (!attempts) attempts={};

	var offset = parseInt(Math.random()*count);
	logger.debug('offset = ' + offset, 'left: ' , left, 'attempts', attempts);
	Question.findOne({},'', { skip: offset }, function (err, question){
		if (err) return strLog('find_random_question Err ' + JSON.stringify(err), 'Err');

		// check if it is not prepared for special tournament;
		// and we did not add this question before
		logger.debug('tryToLoadQuestion: ', question.question);

		if (is_not_special(question) && !attempts[offset] && isModerated(question) ) { //!question_was_added(offset, attempts)
			add_question_to_list(gameID, question); //attempts.push(offset);
			attempts[offset] = 1;

			if (left > 1) return find_random_question(gameID, left - 1, count, attempts);
		} else {
			find_random_question(gameID, left, count, attempts);
		}
	})
}

function isModerated(question){
	if (question) {
		return question.moderation == MODERATION_MODIFIED || question.moderation == MODERATION_OK || question.moderation == null;
	} else {
		return null;
	}
}

function is_not_special(question){
	return (!question.tournamentID);
}

function loadRandomQuestions(gameID){
	Question.count(function (err, count){
		if (err) {
			logger.error('err while count', err);
		} else {
			logger.debug('count= ' + count);
			games[gameID].questions = [];

			find_random_question(gameID, NUMBER_OF_QUESTIONS, count, {});
		}
	})
}

function load_questions_fromDB(gameID) {
	Question.find({ tournamentID: gameID }, '', function (err, questions){
		logger.log('load_questions_fromDB ' + gameID);

		if (err) {
			strLog('err in special questions for ' + gameID, 'Err');
		}

		if (questions && questions.length > 0) return set_questions(questions, gameID);

		strLog('no special questions for ' + gameID, 'Games');
		loadRandomQuestions(gameID);
	})
}

function load_topic_questions(gameID){
	var topic = games[gameID].settings.topic;
	// strLog("searching questions for newbies... Topic:"+ topic, "Games");

	loadQuestions({ topic: topic },'', true)
	.then(function (questions){
		set_questions(questions, gameID)
	})
	.catch(function (err){
		strLog('err in load_topic_questions for ' + gameID, 'Games');

		loadRandomQuestions(gameID);
	})
}

function getTopic(gameID){
	if (!games[gameID] || !games[gameID].settings || !games[gameID].settings.topic) return '';

	return games[gameID].settings.topic
}

var NEED_FOR_CATEGORY = 6;

function setQuestions(gameID, topic){
	if (questionBase[topic].length < NEED_FOR_CATEGORY) return set_questions(questionBase[topic], gameID);
	
	var already = {}; // questionIndex=> 1
	var count = questionBase[topic].length;

	games[gameID].questions = [];

	while (games[gameID].questions.length < NUMBER_OF_QUESTIONS){
		var index = parseInt(Math.random() * count);

		if (!already[index]) {
			add_question_to_list(gameID, questionBase[topic][index]);
			already[index] = 1;
		}
	}
}

function loadByTopic(topic){
	var query = {
		moderation : { $in: [MODERATION_MODIFIED, MODERATION_OK, null] } 
	};

	if (topic) {
		query.topic = topic
	} else {
		query.topic = { $exists: false }
	}

	return loadQuestions(query)
	.then(function (questions){
		if (topic) {
			questionBase[topic] = questions;
		} else {
			questionBase['default'] = questions;
		}
		return questionBase[topic || 'default'];
	})
}

function Init(gameID, playerID){
	if (playerID == 0) {
		games[gameID].questIndex = -1;
		logger.debug(games[gameID].settings);

		var topic = getTopic(gameID) || 'default';

		logger.log('Init', gameID, topic);
		setQuestions(gameID, topic);
		
		games[gameID].userAnswers = [];
	}

	strLog('FULL GAME INFO');
	strLog(JSON.stringify(games[gameID] ));
	
	games[gameID].userAnswers.push({});//[playerID] = {};
}

function AsyncUpdate(gameID){
	// strLog('AsyncUpdate. be aware of  questions length!!! it must be games[gameID].questions' );

	if (games[gameID].questIndex < games[gameID].questions.length - 1){ // NUMBER_OF_QUESTIONS - 1){
		if (games[gameID].questIndex >= 0) {
			checkAnswers(gameID);
		}

		games[gameID].questIndex++;
		send(gameID, 'update', getQuestions(gameID));
	} else {
		checkAnswers(gameID);
		FinishGame(gameID, FindWinner(gameID));
	}

}

function Action(gameID, playerID, movement, userName){
	var currQuestionIndex = games[gameID].questIndex;
	var time = new Date();
	logger.debug('gameID', playerID, movement);

	games[gameID].userAnswers[playerID][currQuestionIndex] = { answer: movement.answer, time: time };
}

var PointsPerSecond = 10;

function checkAnswers(gameID){
	var game = games[gameID];

	var currQuestionIndex = game.questIndex;

	for (var i=0; i < game.userAnswers.length; ++i){
		var AnswerData = game.userAnswers[i][currQuestionIndex];

		if (!AnswerData) continue;

		var answer = AnswerData.answer;

		if (AnswerIsCorrect(gameID, answer)){
			var userName = getUID(gameID, i);
			var now = new Date();
			var diff = now - AnswerData.time;

			games[gameID].scores[userName]+= 1000 + diff * PointsPerSecond / 1000;
		}
	}
}

gs.StartGameServer({
	port:5010,
	gameName:'Questions',
	gameTemplate: 'qst_game'
}, Init, AsyncUpdate, Action, UpdPeriod);

logger.log('QS started');

function FindWinner(gameID){
	var game = games[gameID];
	strLog(JSON.stringify(game.scores));
	var userName = getUID(gameID, 0);
	var maxScore=0;
	
	for (var playerID in game.userIDs) {
		var uName = getUID(gameID, playerID);
		var curScore = game.scores[uName];
		if (curScore > maxScore){
			maxScore = curScore;
			userName = uName;
		}
	}

	strLog('Winner is: ' + userName);
	return userName;
}

function getCurrentQuestion(gameID){
	strLog('getCurrentQuestion : ' + gameID);
	//get number of questions of this topic
	var game = games[gameID];
	if (game) {
		if (games[gameID].questions) {
			var currQuestionIndex = games[gameID].questIndex;
			var q = games[gameID].questions[currQuestionIndex];
			
			strLog('questIndex = ' + currQuestionIndex);
			strLog(JSON.stringify(q));
			return q;
		}
		return null;
	}	else {
		return { question:'GAME DOES NOT EXIST', answers: [0,1,2,3], correct: 1 };
	}
}

function getQuestions(gameID){
	strLog('Rewrite getQuestions function!!');
	var curQuest = getCurrentQuestion(gameID);
	return { question: curQuest.question , answers: curQuest.answers };
}

function AnswerIsCorrect(gameID, answer){
	var correct = getCurrentQuestion(gameID).correct;
	strLog('Player answer = ' + answer + ' , while correct is :' + correct, 'Games');

	return answer && answer == correct;
}
