db = db.getSiblingDB('test')
print(db.getCollectionNames());
//console.log();
//printjson(db.adminCommand('listDatabases'));
//var user = db.users.find({login:'Rabfa'}, 'login password money ');
//print(user);

/*cursor = db.users.find();
while ( cursor.hasNext() ) {
   printjson( cursor.next() );
}*/

/*db.createCollection('games');
db.games.createIndex( { gameName: 1 }, { unique: true } )*/
//db.tournamentregs.createIndex({tournamentID: 1, userID: 1}, {unique: true, name:'OneRegisterPerTournament'});

print('lol');
/*var a = db.users.find();
console.log(a);*/