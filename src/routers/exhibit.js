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
		
	}else{ //domyslne foto
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

//create an exhibit - uzywane poprzez wcisniecie przycisku przez uzytkownika
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

//pokaz wszystkie eksponaty w WYBRANEJ galerii
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

/*  
//AVATAR. image upload
const upload = multer({
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
 */



/* 
router.post('/exhibits/:id/avatar', auth, upload.single('avatar'), async(req,res)=>{
	const buffer = await sharp(req.file.buffer).resize({width:250, height: 300}).png().toBuffer()
	req.user.avatar = buffer
	await req.user.save()
	res.status(200).send()
}, (error,req,res,next)=>{
	res.status(400).send({error: error.message})
})
  */




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