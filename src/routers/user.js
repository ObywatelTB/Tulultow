const express = require('express')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')
const Gallery = require('../models/gallery')

//signup
router.post('/users', async (req,res)=>{
	const user = new User(req.body)
	try{
		await user.save()
		const gallery = await user.createGallery()
		const token = await user.generateAuthToken()
		res.cookie('auth',token)
		res.status(201).send({user,token,gallery})
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
		await res.cookie('auth',token)
		res.send({user}) //{user,token}) //wywala blad, bo chyba nie moze byc po res.cookie()

		//res.redirect('/settings')
		//location.reload()
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
		await req.user.save()
		res.send(req.user)
	}catch(e){
		res.status(500).send(e)
	}
})

//dodawanie punktowanych galerii
router.post('/galleries/favourite', auth, async(req,res)=>{
	req.user.favourite_galleries.push({ favourite_gallery: req.body })
	await req.user.save()
	try{
		res.send(req.user)
	}catch(e){
		res.status(500).send()
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