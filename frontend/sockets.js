alert('Sockets included');
var socket = io();
/*$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});*/

socket.on('chat message', function(msg){
  alert(JSON.stringify(msg));
  //$('#messages').append($('<li>').text(JSON.stringify(msg)));
});
socket.on('StartTournament', function(msg){
  alert(JSON.stringify(msg));
  alert('StartTournament socket works!!');
  var tournamentID = msg['tournamentID'];
  var gameURL = 'PingPong';
  var text = '<button onclick="startGame()"> Play in Tournament</button>';
  $('#news').append(text);
  ///$('#news').append($('<button>').text(JSON.stringify(msg)));
});

function startGame(){
  window.open('/Game');
}

function drawHrefButton (){

}


/* CLIENT SIDE INFO:
  Login Password
  --Money
  Registered TournamentIDs

*/