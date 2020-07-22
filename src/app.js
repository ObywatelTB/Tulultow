const path  = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const app = express()
const port = process.env.PORT || 3000

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('',(req,res)=>{
	res.render('index',{
		title: 'Weather',
		name: 'Tom Hanks'
	})
})

app.get('/help', (req,res)=>{
	res.render('help',{
		title: 'helppppp',
		name: 'yolo'
	})
})

app.get('/about',(req,res)=>{
	res.render('about', {
		title: 'About me',
		name: 'tom h'
	})
})

//the 2nd argument, function, describes what happens
// when somebody visits the chosen page 
// req-(uest) to the server; res(ponse) of the server

 
app.get('/weather',(req,res)=>{
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

app.get('/help/*',(req,res)=>{
	res.render('404',{
		title: '404',
		name: 'Tobson',
		message:'Help article not found.'
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
