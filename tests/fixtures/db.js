const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
	_id: userOneId,
	name: 'Mike Smith',
	email: 'mike@gmail.com',
	password: 'haslo123',
	administrator: false,
	tokens: [{
		token: jwt.sign({_id: userOneId},process.env.TOKEN_SECRET)
	}]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
	_id: userTwoId,
	name: 'Tom Johns',
	email: 'tom@gmail.com',
	password: 'haslo000',
	administrator: false,
	tokens: [{
		token: jwt.sign({_id: userTwoId},process.env.TOKEN_SECRET)
	}]
}


const setupDatabase = async()=>{
	await User.deleteMany()
	await new User(userOne).save()
	await new User(userTwo).save()
}

module.exports = {
	userOneId,
	userOne,
	userTwoId,
	userTwo,
	setupDatabase
}