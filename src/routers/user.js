const express = require('express')
const User = require('../models/user')
const {spawn} = require('child_process') 
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const path  = require('path')
const Gallery = require('../models/gallery')

run_python_script = (argums)=>{
	try{
		if (process.env._ && process.env._.indexOf("heroku")){
			//in heroku
			python_env = 'python'
		}else{
			python_env = process.env.PYTHON_ENV
		}
		// console.log('pyth spawn',python_env)
		const python = spawn(python_env, argums);
	
		python.stdout.on('data',function(chunk){
			var textChunk = chunk.toString('utf8')
			console.log('output from python: ',textChunk)
		})
		python.stderr.on('data',function(data){
			console.log('ERRORS FROM PYTHON!!',data.toString())
		})
	}catch(e){
		console.log(e)
	}
}


//signup
router.post('/users', async (req,res)=>{
	const user = new User(req.body)
	
	const f_path = await path.join(__dirname, '../../public/img/user_b.png')
	var buffer0 = await fs.readFileSync(f_path)
	const buffer = await sharp(buffer0).resize({width:250, height: 300}).png().toBuffer()
	user.avatar = buffer
	
	run_python_script(['src/python/recommend_galleries.py', User.db.name, req.body.email])
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
	run_python_script(['src/python/recommend_galleries.py', User.db.name, req.body.email])
	try{
		user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		await res.cookie('auth',token)
		res.send({user,token}) //there was some error

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


//returns the name of the logged-in user
router.get('/users/logged_name', auth, async(req, res)=>{
	try{
		res.send(req.user)
	}catch(e){
		res.status(500).send(e)
	}
})


//this one used only in Favourites:
router.get('/users', async (req,res)=>{
	try{
		const users = await User.find({})
		res.send(users)
	}catch(e){
		res.status(500).send(e)
	}
})

router.get('/users/galleries', async (req,res)=>{
	try{
		gals = await User.find({}).populate('galleries')//.exec(async function(error, u) {

		gals2 = gals.map(g => g.galleries)
		res.send(gals2)
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

//adding galleries with points - check whether works
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


//modifications to a DATABASE
router.get('/users/clear_db', auth, async (req,res)=>{
	try{
		run_python_script(['src/python/create_db.py', User.db.name, 'clear_db'])
		
		res.send({"python script": "done"})
	}catch(e){
		res.status(500).send(e)
	}
})

router.get('/users/fill_db', auth, async (req,res)=>{
    try{
        run_python_script(['src/python/create_db.py', User.db.name, 'fill_db', 25])
		
		res.send({"python script": "done"})
    }catch(e){
        res.status(500).send(e)
    }
})


//the request below has to be written AFTER other reaquests like: 'users/x' !!
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

//adding the default picture (hard coded)
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