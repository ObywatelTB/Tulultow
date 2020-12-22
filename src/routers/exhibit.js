const express = require('express')
const Gallery = require('../models/gallery')
const Exhibit = require('../models/exhibit')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const path  = require('path')
const fs = require('fs')
const sharp = require('sharp')

set_picture = async(exhibit, sent_buffer, category)=>{
	if(sent_buffer){
		
	}else{ //default picture
		if ("Song Book Game Film Quote Dish Perfume Person Place Invention".includes(category)){
			file_path = '../../public/img/cats/'+ category.toLowerCase() +'.png'
		}else{
			file_path = '../../public/img/cats/other.png'	
		}
		const f_path = await path.join(__dirname, file_path)
		var buffer0 = await fs.readFileSync(f_path)
		const buffer = await sharp(buffer0).resize({width:100, height: 100}).png().toBuffer()
		exhibit.picture = buffer
	}
	exhibit.save()
}

//create an exhibit - used when user presses a button
router.post('/exhibits', auth, async(req,res)=>{
	const gallery = await Gallery.findOne({owner: req.user._id})
	const ex_data = {
		title: req.body.title, 
		content: req.body.content, 
		category: req.body.category, 
		owner: gallery._id
	}
	const exhibit = new Exhibit(ex_data)
	await set_picture(exhibit, req.body.picture, req.body.category)
	
	gal_rooms_cats = gallery.rooms.map((r)=>{ //can be replaced by simpler, checking categories
		return r.room.category
	})
	
	if(gal_rooms_cats.includes(req.body.category)){ //such a room already exists
		//the one below overwrites the gallery!
		gallery.rooms.map((r)=>{
			if(r.room.category === req.body.category)
				r.room.exhibits.push( exhibit._id )
			return r
		})
	}else{		//there's no such room yet
		gallery.rooms.push({room:{category: req.body.category, exhibits:[ exhibit._id ]  }})
		gallery.categories.push( req.body.category )
		//ADD A RECORD TO CATEGORIES
	}
	await gallery.save()
	try{
		await exhibit.save()
		res.send(exhibit)
	}catch(e){
		res.status(500).send(e)
	}
}) 

router.get('/exhibits/:id/pic', async (req,res)=>{
	try{
		const exhibit = await Exhibit.findById(req.params.id)
			
		if(!exhibit || !exhibit.picture){
			throw new Error()
		}
		res.set('Content-Type','image/png')
		res.send(exhibit.picture)
	}catch(e){
		res.status(400).send()
	}
})

//show all the exhibits in the gallery of the logged-in user
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

//show all the exhibits in the CHOSEN gallery
router.get('/exhibits/:id/:room', auth, async(req,res)=>{
	const gallery = await Gallery.findById(req.params.id)
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


module.exports = router