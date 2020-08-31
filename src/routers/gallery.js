const express = require('express')
const Gallery = require('../models/gallery')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')

//create a gallery - prolly gotta be deleted
router.post('/galleries', auth, async(req,res)=>{
	/* const gallery = new Gallery({
		categories: [{category: "Song"}, {category: "Film"}],
		owner: '5f280d05fe326f2d7410120c'
	})
	try{
		await gallery.save()
		res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	} */
})

//show a YOUR gallery
router.get('/galleries/me', auth, async(req,res)=>{
	const gallery = await Gallery.find({owner: req.user._id})
	try{
		res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	}
})

//show a particular gallery (yours or not) given galleries id
router.get('/galleries/:id', auth, async(req,res)=>{
	const gallery = await Gallery.findById(req.params.id)
	try{
		res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	}
})

//you give the id OF THE GALLERY, it returns id of its owner
router.get('/galleries/owner/:id',auth,async(req,res)=>{
	try{
		const gallery = await Gallery.findOne({_id: req.params.id})
		const owner_id = await gallery.owner
		const user = await User.findOne({_id: owner_id})
		res.send(user)
	}catch(e){
		res.status(500).send(e)
	}
})

//add a category
router.post('/galleries/category', auth, async(req,res)=>{
	const gallery = await Gallery.findOne({owner: req.user._id})
	gallery.categories.push(req.body.category)
	gallery.rooms.push( {room:{category: req.body.category}} )
	await gallery.save()
	try{
		res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	}
})

module.exports = router