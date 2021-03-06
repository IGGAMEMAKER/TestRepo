var Collection = require('../models/collections');
var Gifts = require('../models/gifts');
var Packs = require('../models/packs');
var Tournaments = require('../models/tournaments');
var Message = require('../models/message');
var Category = require('../models/category');


// var app, io;
var io;
var frontendVersion;


objects = {
	counter: 0,
	updater: {},
	cards: [],
	packs: [],
	userpacks: userpacks,
	news: null,
	categories: [],
	UPDATE_ALL: UPDATE_ALL,
	tournaments: null
};

function save(name){
	return function (result){
		objects[name] = result;
		return result;
	}
}

function send(name){
	return function(result){
		io.emit(name, result);
	}
}

function UPDATE_ALL() {
	update_collections();
	update_cards();
	update_packs();

	update_category();
	
	update_news();
}

UPDATE_ALL();
// update_collections();

// Collection.all({}).then(save('collections'));//.then(console.log)
// Gifts.cards().then(save('cards'));//.then(console.log)

update_tournaments(1000);

function update_collections(){ 
	Collection.all({}).then(save('collections')); 
}
function update_cards(){ 
	Gifts.cards().then(save('cards')); 
}

function update_news(){
	Message.news.active().then(save('news'));
	// Message.news.all().then(save('news'))
}

function update_category(){
	Category.available().then(save('categories'))
}

function update_packs(){ 
	Packs.available().then(save('packs'));
	Packs.update();
}

function userpacks(){
	// var arr=[];
	// for (var i = 0; i < objects.packs.length; i++) {
	// 	var pack = objects.packs[i];
  //
	// 	if (!pack.visible || !pack.available) continue;
	// 	arr.push({
	// 		packID: pack.packID,
	// 		price: pack.price,
	// 		image: pack.image
	// 	})
	// }
	// return arr
	return objects.packs
		.filter(p => p.available && p.visible)
		.map(p => {
			return {
				packID: p.packID,
				price: p.price,
				image: p.image
			}
		})
}

function update_tournaments(period) {
	Tournaments.get()
  .then(function (tournaments){
    if (tournaments) { 
    	objects.updater.tournaments = tournaments;
    	objects.tournaments = tournaments;
    }
    // if (frontendVersion) objects.updater.frontendVersion = frontendVersion;

    return objects.updater; // io.emit('update', updater);
  })
  .then(send('update'))
  .catch(console.error);

  setTimeout(function(){
		update_tournaments(period)
	}, period);
}

setInterval(function() {
	objects.counter++;
}, 1000);


// module.exports = function(_app, _io){
module.exports = function(_io){
	// app = _app;
	io = _io;
	return function(){
		return objects;
	};
};
