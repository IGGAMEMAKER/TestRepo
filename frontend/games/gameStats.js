console.log('gameStats.js loaded');
var recievedData =0;
function UserGetsData(tournamentID){
	//console.log(tournamentID);
	statSend('UserGetsData', {tournamentID:tournamentID, login:login} );
}

function GameLoaded(tournamentID, login){
	console.log('GameLoaded : ' + tournamentID + '  ' + login);
	statSend('GameLoaded', {tournamentID:tournamentID, login:login} );
}
GameLoaded(tournamentID, login);



var rcvTimer = setInterval(function(){
	UserGetsData(tournamentID);
	recievedData=0;
}, 3000)


function printer(data){
	console.log(data);
}

function statSend(url, data){
	$.ajax({
		url: 'http://localhost/'+url,
		method: 'POST',
		data: data,
		success: printer
	});
}