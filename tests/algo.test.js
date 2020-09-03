const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')
const {spawn} = require('child_process')

beforeEach(setupDatabase)

test('Should work', async()=>{
	const python = spawn(process.env.PYTHON_ENV, 
		['src/python/CreateListOfRecommended.py', userOne.email]);
		
})

