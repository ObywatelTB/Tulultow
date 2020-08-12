const express = require('express')
const Gallery = require('../models/gallery')
const Exhibit = require('../models/exhibit')
const router = express.Router()
const auth = require('../middleware/auth')

//create an exhibit - uzywane poprzez wcisniecie przycisku przez uzytkownika
router.post('/exhibits', auth, async(req,res)=>{
	const gallery = await Gallery.findOne({owner: req.user._id})
	const exhibit = new Exhibit({...req.body, owner: gallery._id})
	
	gal_rooms_cats = gallery.rooms.map((r)=>{ //to bedzie zamienione na prostsze, sprawdzanie categories
		return r.room.category
	})
	if(gal_rooms_cats.includes(req.body.category)){ //juz istnieje taki pokoj
		//ponizsze nadpisuje gallery!
		gallery.rooms.map((r)=>{
			if(r.room.category === req.body.category)
				r.room.exhibits.push( exhibit._id )
			return r
		})
	}else{		//jeszcze nie istnieje taki pokoj
		gallery.rooms.push({room:{category: req.body.category, exhibits:[ exhibit._id ]  }})
		gallery.categories.push( req.body.category )
		//DODAC WPIS DO categories
	}
	await gallery.save()
	try{
		await exhibit.save()
		res.send(exhibit)
	}catch(e){
		res.status(500).send(e)
	}
}) 

//pokaz wszystkie eksponaty w galerii zalogowanego uzytkownika
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

//DELETE AN EXHIBIT
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

//pokaz wybrany eksponat w galerii
/* router.get('/exhibits/:id', auth, async(req,res)=>{
	const gallery = await Gallery.find({owner: req.user._id})
	try{
		//res.send(gallery)
	}catch(e){
		res.status(500).send(e)
	}
}) */

module.exports = router