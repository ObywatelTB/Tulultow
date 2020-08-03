const express = require('express')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')


//signup
router.post('/users', async (req,res)=>{
	const user = new User(req.body)
	try{
		await user.save()
		const token = await user.generateAuthToken()
		res.cookie('auth',token)
		res.status(201).send({user,token})
	}catch(e){
		res.status(400).send(e)
	}
})

//chyba do wyrzucenia, zastapienia:
//PONIZSZE TYLKO Z MYSLA O FAVOURITES:
router.get('/users', async (req,res)=>{
	try{
		const users = await User.find({})
		res.send(users)
	}catch(e){
		res.status(500).send(e)
	}
})

//login
router.post('/users/login', async(req,res)=>{
	try{
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.cookie('auth',token)
		console.log('users login, token: ',token)
		res.send({user,token})
		location.reload(true)
	}catch(e){
		res.status(400).send(e)
	}
})
//logout
router.post('/users/logout', auth, async(req,res)=>{
	try{
		req.user.tokens = req.user.tokens.filter((token)=>{
			return token.token != req.token
		})
		//console.log('AAAAAA')
		await req.user.save()
		res.send(req.user)
		
		//location.reload(true)
	}catch(e){
		res.status(500).send(e)
	}
})

router.get('/users/:id', auth, async(req,res)=>{
	const _id = req.params.id
	try{
		const user = await User.findById(_id)
		if(!user){
			throw new Error('no such user in the db!')
		}
		res.send(user)
	}catch(e){
		
	}
})



module.exports = router