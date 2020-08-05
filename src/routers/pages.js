const express = require('express')
const User = require('../models/user')
const router = express.Router()
const geocode = require('../weather_utils/geocode')
const forecast = require('../weather_utils/forecast')
const auth = require('../middleware/auth')


router.get('',auth, (req,res)=>{
	res.render('index',{
		title: 'Gallery',
		name: 'Tom Hanks'
	})
})



router.get('/favourites', auth, (req,res)=>{
	res.render('favourites',{
		title: 'Your favourite galleries',
		name: 'something'
	})
})

router.get('/browse_galleries', auth,(req,res)=>{
	res.render('browse_galleries', {
		title: 'Browse galleries',
		name: 'tom h'
	})
})

router.get('/settings', auth, async(req,res)=>{
	try{
		const user = req.user
		res.render('settings', {
			title: 'Settings',
			name: user.name
	})
	}catch(e){
		res.status(500).send(e)
	}
})


//====== POGODA, DO WYWALENIA. 
router.get('/weather',(req,res)=>{
	res.render('weather', {
		title: 'Weather page',
		name: 'check weather out'
	})
})

//the 2nd argument, function, describes what happens
// when somebody visits the chosen page 
// req-(uest) to the server; res(ponse) of the server
router.get('/w',(req,res)=>{
	if(!req.query.address){
		return res.send({
			error: 'you must provide an address term!'
		})
	}
	geocode(req.query.address, (error, {latitude,longitude,location}={})=>{
		if(error){
			 return res.send({error})
		}
		forecast(latitude, longitude, (error, forecastData)=>{
			if(error){
				return res.send({error})
			}
			res.send({
				forecast: forecastData,
				location: location,
				address: req.query.address
			})
		})
	})
})
	
router.get('/products', auth,(req,res)=>{
	if(!req.query.search){
		return res.send({
			error: 'you must provide a search term!'
		})
	}
	console.log(req.query.search)
	res.send({
		products: []
	})
})


router.get('/favourites/*', auth,(req,res)=>{
	res.render('404',{
		title: '404',
		name: 'Tobson',
		message:'Favourites subpage not found.'
	})
})

//THIS ONE HAS TO BE LAST!
//* -wild card character. match everything that wasnt matched so far
router.get('*',(req,res)=>{
	res.render('404',{
		title: '404',
		name: 'Tobson',
		message: 'Page not found.'
	})
})



module.exports = router