const express = require('express')
const User = require('../models/user')
const {spawn} = require('child_process')  //<==============
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const path  = require('path')
const Gallery = require('../models/gallery')


//signup
router.post('/users', async (req,res)=>{
	const user = new User(req.body)
	
	const f_path = await path.join(__dirname, '../../public/img/user_b.png')
	var buffer0 = await fs.readFileSync(f_path)
	const buffer = await sharp(buffer0).resize({width:250, height: 300}).png().toBuffer()

	user.avatar = buffer
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

//login
router.post('/users/login', async(req,res)=>{
	user = {}
	//const python = spawn(process.env.PYTHON_ENV, 
		//['src/python/CreateListOfRecommended.py', user.email]); //<==============
	try{
		user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		await res.cookie('auth',token)
		res.send({user,token}) //wywala blad, bo chyba nie moze byc po res.cookie()

		//res.redirect('/settings')
		//location.reload()
	}catch(e){
		res.status(400).send(e)
	}
	
	try{
		const pypath = 'src/python/CreateListOfRecommended.py'
		//const pypath = 'src/python/printa.py'
		const python = spawn(process.env.PYTHON_ENV,[pypath, user.email]); //<==============	
	
		python.on('close', (code) => {
			console.log(`Child process close all stdio with code ${code}`);
		})
	}catch(e){
		console.log(e)
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

router.get('/users/me', auth, async (req,res)=>{
	try{
		const user = await req.user
		res.send(user)
	}catch(e){
		res.status(500).send(e)
	}
})

router.post('/users/recommended', auth, async(req,res)=>{
	req.user.recommended_galleries.push( req.body )
	await req.user.save()
	try{
		res.send(req.user)
	}catch(e){
		res.status(500).send()
	}
})

//dodawanie punktowanych galerii - sprawdzic czy dziala
router.post('/users/favourite', auth, async(req,res)=>{
	req.user.favourite_galleries.push({ favourite_gallery: req.body })
	await req.user.save()
	try{
		res.send(req.user)
	}catch(e){
		res.status(500).send()
	}
})

router.get('/users/db_name', auth, async (req,res)=>{
	try{
		db_name =  User.db.name
		res.send({name: db_name})
	}catch(e){
		res.status(500).send(e)
	}
})


//modyfikacje do BAZY DANYCH
router.get('/users/clear_db', auth, async (req,res)=>{
	try{
		const python = spawn(process.env.PYTHON_ENV, 
			['src/python/CreateListOfRecommended.py', user.email]);
	}catch(e){
		res.status(500).send(e)
	}
})



//ponizszy request musi byc PO innych 'users/x' !!
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



//AVATAR. image upload
const upload = multer({
	//dest: 'avatars', //destination
	limits: {
		fileSize: 1000000
	},
	fileFilter(req,file,cb){
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
			return cb(new Error('please upload jpg,jpeg,png!'))
		}
		
		cb(undefined,true) 
	}
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req,res)=>{
	const buffer = await sharp(req.file.buffer).resize({width:250, height: 300}).png().toBuffer()
	req.user.avatar = buffer
	await req.user.save()
	res.status(200).send()
}, (error,req,res,next)=>{
	res.status(400).send({error: error.message})
})

//wrzucanie domyslnego foto (hard coded)
router.post('/users/me/avatar_init', auth, upload.single('avatar'), async(req,res)=>{
	const f_path = path.join(__dirname, '../../public/img/user_b.png')
	var buffer0 = fs.readFileSync(f_path)
	const buffer = await sharp(buffer0).resize({width:250, height: 250}).png().toBuffer()
	req.user.avatar = buffer
	await req.user.save()
	res.status(200).send()
}, (error,req,res,next)=>{
	res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, upload.single('avatar'),async(req,res)=>{
	 req.user.avatar = undefined
	 await req.user.save()
	 res.status(200).send()	
},(error,req,res,next)=>{
	res.status(500).send(error)
})

router.get('/users/:id/avatar', async (req,res)=>{
	try{
		const user = await User.findById(req.params.id)
			
		if(!user || !user.avatar){
			throw new Error()
		}
		res.set('Content-Type','image/png')
		res.send(user.avatar)
	}catch(e){
		res.status(400).send()
	}
})



module.exports = router