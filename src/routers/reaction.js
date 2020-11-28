const express = require('express')
const Gallery = require('../models/gallery')
const Exhibit = require('../models/exhibit')
const Reaction = require('../models/reaction')
const router = express.Router()
const auth = require('../middleware/auth')

//create a reaction - tworzone przy kliknieciu przycisku
router.post('/reactions/like', auth, async(req,res)=>{
	const exhibit = await Exhibit.findById(req.body.exhibit)
	reactions = await Reaction.findOne({gallery: req.body.gallery})
	if(!reactions){
		reactions = new Reaction({ gallery:req.body.gallery})
	}
	const react_data = {
		exhibit: req.body.exhibit,
		author: req.user._id, 
		like: req.body.like
	}

	if(req.body.like){
		reactions.reactions.push( react_data )
		exhibit.likes = exhibit.likes + 1
		await exhibit.save()
	}else{ //czyli ktos odlajkowal
		//tu skasowac te reakcje z listy reactions
		exhibit.likes = exhibit.likes - 1
		await exhibit.save()
	}
	//console.log(exhibit)
	await reactions.save()
	
	try{
		res.send(reactions)
	}catch(e){
		res.status(500).send(e)
	}
	
}) 

router.post('/reactions/comment', auth, async(req,res)=>{
	//const exhibit = await Exhibit.findById(req.body.exhibit)
	const reactions = new Reaction({ gallery:req.body.gallery})
	const react_data = {
		exhibit: req.body.exhibit,
		author: req.user._id, 
		comment: req.body.comment,
	}
	reactions.reactions.push( react_data )

	//console.log(exhibit)
	await reactions.save()
	try{
		res.send(reactions)
	}catch(e){
		res.status(500).send(e)
	}
}) 

/* 
//pokaz wszystkie reakcje w galerii zalogowanego uzytkownika
router.get('/exhibits/:room', auth, async(req,res)=>{
	const gallery = await Gallery.findOne({owner: req.user._id})
	var exhibits = {}
	if(gallery.rooms[req.params.room]){
		exhibits_ids = gallery.rooms[req.params.room].room.exhibits
		exhibits = await Exhibit.find({'_id': { $in : exhibits_ids }})
	}else{
		console.log('get exhibits. nie ma tej kategorii')
	}
	try{
		res.send(exhibits)
	}catch(e){
		res.status(500).send(e)
	}
})

//DELETE A REACTION
router.delete('/exhibits/:id', auth, async(req,res)=>{
	const gallery = await Gallery.findOne({owner: req.user._id})
	try{
		const exhibit = await Exhibit.findOneAndDelete({ _id: req.params.id, owner: gallery._id})
		if(!exhibit)
			return res.status(404).send()
		res.send(exhibit)
	}catch(e){
		res.status(505).send(e)
	}
}) 
 */


module.exports = router

