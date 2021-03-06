var db = require('../db');
var Collection = db.wrap('Collection');
// var await = require('await')


function all(query){
	return Collection.list(query)
}

function getByID(collectionID){
	return Collection.findOne({ _id : collectionID })
}

function getByName(name){
	return Collection.findOne({ name: name })
}

function add(list, name, reward){
	return Collection.save({
		list:list,
		name:name,
		reward:reward
	})
}

function edit(collectionID, data){
	return update(collectionID, data);
}

// setParameter('56f7dd80a6d68f463e022c0e', 'rewardType', 1)
// .then(console.log)
// .catch(console.error)

function setParameter(id, parameter, value){
	var obj = {};
	obj[parameter] = value;
	console.log(id, obj);
	return update(id, obj)
}

function setColour(id, colour){
	return update(id, { colour: colour })
}

function setDescription(id, description){
	return update(id, { description: description })
}

function setReward(id, parameter, value){
	var obj = {};
	obj['reward.' + parameter] = value;
	return update(id, rewardObj)
}

function setRewardType(id, type){
	return update(id, { rewardType: parseInt(type)||0 })
}



function copy(from, to){
	return getByID(from)
	.then(function (collection){
		var obj = {
			list:collection.list||[]
		}
		return update(to, obj)
	})
}

function update(id, upd) {
	return Collection.update({ "_id":id }, { $set: upd })
}

function remove(id){
	return Collection.remove({ _id:id })
}

function clear(id){
	return update(id, { list:[] })
}

function attachGift(id, giftID){
	return getByID(id)
	.then(function (collection){
		// console.log(collection);

		var list = collection.list;
		list.push(giftID);
		// console.log(list);

		var obj =  {
			list : list
		}

		return update(id, obj);
	})
}
// Tests
// console.log(Collection)

// var giftID = '5609a7da4d4145c718549ab3';
// var colID = '56f438b27c7ccf0914389f1d';

// all({})
// add([], 'col1', {})
// attachGift(colID, giftID)
// clear(colID)
// getByID(colID)
// .then(console.log)
// .catch(console.error)

// all({})
// getByID('5622b320ecdf83f91ef09036')

// .then(console.log)
// .catch(console.error)

module.exports = {
	all:all,
	getByID:getByID,
	getByName:getByName,
	add:add,
	remove:remove,
	copy:copy,
	clear:clear,

	attachGift:attachGift,

	setColour:setColour,
	setDescription:setDescription,
	setReward:setReward,
	setParameter:setParameter,
	setRewardType:setRewardType,

	edit:edit
}