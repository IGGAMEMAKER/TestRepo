var room;

var wanna_play = !true;

function reg(topic){
	if (wanna_play)	setAsync('/Category/tournament/'+topic, null, function (msg){})
}

function drawFrame(msg){
	var gamePort = msg.gamePort;
	var gameHost = msg.gameHost;
	var tournamentID = msg.tournamentID;

	// reconnect(tournamentID, gameHost, gamePort)
	var src = 'http://'+gameHost+':'+gamePort+'/Game?tournamentID='+tournamentID;
	// if (tournamentID) {
	// 	var reg_button = '<a onclick="join('+topic+')" class="btn btn-primary"> Играть </a>'
	// }
	var form = '<form style="display:none;" name="playForm" target="myIframe" action="'+ src + '" method="post">'
	form += '<input type="hidden" name="login" value='+login+' />'
	form += '<input type="submit">'
	form += '</form>'
	/*
<form target="myIframe" action="http://localhost/post.php" method="post">
    <input type="hidden" value="someval" />
    <input type="submit">
</form>
	*/
	var iframe = form + '<div style="background:white" width="100%">'//style="height: 500;"
		// iframe += '<iframe name="myIframe" width="100%" height=600 frameborder=0 src="'+src+'" />'
		iframe += '<iframe name="myIframe" width="100%" height=600 frameborder=0 src="" />'
		iframe += ' </div>'
	$("#play").html(iframe);

	// $("#playForm").submit()
	document.playForm.submit();
}

function connect(topic){
	room = io('/topic/'+topic)
	
	room.on('wakeUp', function (msg){
		console.log('wakeUp', msg)
		drawFrame(msg)
	})

	room.on('online', function (msg){
		console.log('online', msg)
		reg(topic);
	})

	room.on('onliners', drawOnliners)
}

function drawOnliners(msg){
	console.log('drawOnliners', msg)
	var players = msg;
	$("#onliners").html('<b>Сейчас играют </b><br>');

	for (var i = players.length - 1; i >= 0; i--) {
		var login = players[i]
		$("#onliners").append(login+'<br>');
	};
}

function join(topic){

}

function reconnect(tournamentID, gameHost, gamePort){
	con = 'http://' + gameHost+':' + gamePort + '/'+tournamentID;

	console.log(con)
	room = io.connect(con);
}