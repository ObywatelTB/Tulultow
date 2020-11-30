const express = require('express')
const Gallery = require('../models/gallery')
const Exhibit = require('../models/exhibit')
const Reaction = require('../models/reaction')
const router = express.Router()
const auth = require('../middleware/auth')

//switches like reaction (like/dislike)  - executed when clicking the like button
router.post('/reactions/switch_like', auth, async(req,res)=>{
	exhibit = await Exhibit.findById(req.body.exhibit_id)
	reactions = await Reaction.findOne({gallery_id: req.body.gallery_id})
	excerpt = {} 		//the like reaction for our user
	like_state = true	//(user gives a like by default)
	if(!reactions){ //its the first like in the gallery
		reactions = new Reaction({ gallery_id: req.body.gallery_id})
		console.log('Created a reactions record (with a like) for a new gallery!')
	}

	arr = reactions.likes
	if (arr.lenght != 0){	//there are already some likes in the gallery
		filterBy = await {exhibit_id: req.body.exhibit_id,
			author_id:  req.user._id }
	
		excerpts = arr.filter(function(record){
			return Object.keys(filterBy).every(function(k){
				return String(record[k]) == String(filterBy[k])
			})
		})
		if(excerpts.length > 1){
			throw 'BLAD w mechanizmie lajkow. Przypada wiecej rekordow na jednego uzytkownika.'
		}

		excerpt = excerpts[0]
		if(excerpt){
			like_state = false
		}
	}

	if(like_state){	//somebody gave a like
		const reaction_data = {
			exhibit_id: req.body.exhibit_id,
			author_id: req.user._id
		}
		reactions.likes.push( reaction_data )
		exhibit.likes = exhibit.likes + 1
		await exhibit.save()
	}else{ 			//somebody disliked
		likes_ar = reactions.likes
		ex_index = -1
		for(i=0; i<likes_ar.length; i++){
			if (likes_ar[i]._id == excerpt._id){
				ex_index = i
				break
			}
		}
		likes_ar.splice(ex_index,1)	//deletion of a record
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

//wykonywane przy wyslaniu komentarza
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

