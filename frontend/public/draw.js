var PLAY_FIELD='#tournaments';
var PLAY_FIELD='#playButtons';
//var PLAY_FIELD='#news';

function drawButton(host, port, tournamentID){
  var parameters = '\''+host +'\','+port+','+tournamentID; // prt(parameters);
  var text = '<button onclick="startGame(' + parameters + ')" style="width:300px;height:60px;"> PLAY '+tournamentID+'</button><br>';//"' + gameURL + '"// prt(text);
  
  $(PLAY_FIELD).append(text);
}

function getAddressFromAddrList(addresses, tournamentID){
  if (!tournamentID) return null;

  if (!addresses) return null;

  /*var addr1 = addresses[tournamentID]; console.log(addr1);
  if (!addr1) return null;*/

  var address = addresses[tournamentID];//.address;

  if (address && address.host && address.port && address.running==TOURN_START) return address;

  return null;
}

function drawPlayButtons(){
  console.log('------------');
  console.log('drawPlayButtons');
  var tournaments = getTournaments(); // prt(tournaments);
  var addresses   = getObject('addresses'); console.log('addresses',addresses);

  $(PLAY_FIELD).html('<p onclick="closePopup(\'tournaments\');"> CLOSE </p>'); // drawHideLink
  //console.log(tournaments);
  //console.log(addresses);

  if (tournaments && addresses){  
    for (var i = tournaments.length - 1; i >= 0; i--) {
      var tournamentID = tournaments[i]; // console.log(tournamentID);
      var address = getAddressFromAddrList(addresses, tournamentID);
      //var address = addresses[tournamentID];//);
      //console.log(address);
      if (address) drawButton(address.host, address.port, tournamentID);
    }
  }
  else{
    $(PLAY_FIELD).append('No tournaments available'); //closePopup('tournaments');
  }
}

function drawWindowForGame(gameURL, port, tournamentID){
  var addr = 'http://'+gameURL+':'+port+'/Game?tournamentID='+tournamentID;
    
  var txt = '<form id="TheForm" method="post" action="'+addr+'" target="TheWindow"><input type="hidden" name="login" value="'+login+'" /> </form>';
  $(PLAY_FIELD).append(txt);

  
  var wind = window.open('', 'TheWindow');
  document.getElementById('TheForm').submit();
  wind.focus();

  closePopup('tournaments');
}

function closePopup(name){
  //prt('closePopup');
  document.getElementById(name).style.display='none';
}

function drawPopup(){
  //prt('OPEN POPUUUUUUP!!!!');
  document.getElementById('tournaments').style.display='block';
  //prt('popup opened');
}

//function drawProfile(money, tournaments, )