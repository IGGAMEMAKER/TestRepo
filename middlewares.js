
var authenticated = function(req, res, next){
	if (req.session && req.session.login){
		req.login = req.session.login;
		next();
	} else {
		res.redirect('Login');
	}
};

var isAdmin = function (req, res, next) {
	// console.log('middlewares isAdmin', req.session.login);
	// next(null);
	// return;

	// if (!req.session) {
	// 	next(null);
	// 	return;
	// }

	if (req.session.login == '23i03g' || req.session.login == 'g.iosebashvili') {
		next()
	} else {
		next(1);
	}
};

var isModerator = function(req, res, next) {
	if (req.session.login=='23i03g'|| req.session.login=='g.iosebashvili' || req.session.login == 'AlexeyKing') {
		next()
	} else {
		next(null);
	}
};

var isContentManager = function(req, res, next) {
	if (req.session.login=='23i03g'|| req.session.login=='g.iosebashvili' || req.session.login == 'AlexeyKing') {
		next()
	} else {
		next(null);
	}
};


// middlewares and helpers

function json(req, res, next){
	if (req.err) {
		res.json({ err: req.err })
	} else {
		res.json({ data: req.data || null })
	}
}

function send_error(err, req, res, next){
	console.error(err);
	res.json({ err: err });
}

// function get_stats(req, res, next){
// 	return
// }


function answer(req, next){
	return function (data){
		req.data = data;
		next();
	}
}

function printer(msg){
	console.log(msg);
	return msg;
}

var std = [json, send_error];

var draw_list = [drawList, send_error];

function drawList(req, res, next){
	var list = req.data || [];
	var txt='';
	console.log(list);
	for (var i=0; i<list.length; i++){
		txt += JSON.stringify(list[i]) + '\n';
	}
	res.end(txt);
}

function render(renderPage){
	return function(req,res, next){
		// console.log(renderPage, req.data);
		res.render(renderPage, { msg: req.data })
	}
}




module.exports = {
	authenticated,

	moderator: [authenticated, isModerator],
	contentManager: [authenticated, isContentManager],
	isAdmin: [authenticated, isAdmin],
	// isAdmin,

	drawList: draw_list,
	send_error,
	answer,
	render,
};
