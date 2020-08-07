const express = require('express')
const Gallery = require('../models/gallery')
const router = express.Router()
const auth = require('../middleware/auth')

//create a gallery - raczej tylko do testu, bo tworzona z marszu przy signup
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

//pokaz dana galerie (swoja lub czyjas)
router.get('/galleries/me', auth, async(req,res)=>{
	const gallery = await Gallery.find({owner: req.user._id})
	try{
		res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	}
})

module.exports = router