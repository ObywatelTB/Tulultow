require('./db/mongoose')
const path  = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./weather_utils/geocode')
const forecast = require('./weather_utils/forecast')
const User = require('./models/user')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) //to jest ta dodana linijka!!!

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

//BAZA DANYCH
app.post('/users', async (req,res)=>{
	const user = new User(req.body)
	
	try{
		await user.save()
		res.status(201).send(user)
	}catch(e){
		res.status(400).send(e)
	}
})

app.get('/users', async (req,res)=>{
	try{
		const users = await User.find({})
		res.send(users)
	}catch(e){
		res.status(500).send(e)
	}
})

app.get('/users/:id', async(req,res)=>{
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

app.get('',(req,res)=>{
	res.render('index',{
		title: 'Gallery',
		name: 'Tom Hanks'
	})
})

app.get('/favourites', (req,res)=>{
	res.render('favourites',{
		title: 'Your favourite galleries',
		name: 'something'
	})
})

app.get('/browse_galleries',(req,res)=>{
	res.render('browse_galleries', {
		title: 'Browse galleries',
		name: 'tom h'
	})
})

app.get('/user', async(req,res)=>{
	try{
		const users = await User.find({})
		res.render('user', {
			title: users[0].name,
			name: 'something'
	})
	}catch(e){
		res.statu(500).send(e)
	}
})





//====== POGODA, DO WYWALENIA. 

app.get('/weather',(req,res)=>{
	res.render('weather', {
		title: 'Weather page',
		name: 'check weather out'
	})
})

//the 2nd argument, function, describes what happens
// when somebody visits the chosen page 
// req-(uest) to the server; res(ponse) of the server
app.get('/w',(req,res)=>{
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
	
app.get('/products',(req,res)=>{
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





app.get('/favourites/*',(req,res)=>{
	res.render('404',{
		title: '404',
		name: 'Tobson',
		message:'Favourites subpage not found.'
	})
})

//THIS ONE HAS TO BE LAST!
//* -wild card character. match everything that wasnt matched so far
app.get('*',(req,res)=>{
	res.render('404',{
		title: '404',
		name: 'Tobson',
		message: 'Page not found.'
	})
})

//starts a server, makes it listen on a specific port
// its waiting for requests
app.listen(port, ()=>{
	//WONT display in the browser
	console.log("Server is up on port "+port)
}) 
