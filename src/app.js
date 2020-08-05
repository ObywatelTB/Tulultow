require('./db/mongoose')
const path  = require('path')
const express = require('express')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const userRouter = require('./routers/user')
const pagesRouter = require('./routers/pages')
const galleryRouter = require('./routers/gallery')

const app = express()
const port = process.env.PORT || 3000

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

app.use(express.json()) //to jest ta dodana linijka!
app.use(cookieParser())
app.use(userRouter)
app.use(galleryRouter)
app.use(pagesRouter)  //MUSI BYC NA KONCU, BO MA *


//starts a server, makes it listen on a specific port
// its waiting for requests
app.listen(port, ()=>{
	//WONT display in the browser
	console.log("Server is up on port "+port)
}) 
