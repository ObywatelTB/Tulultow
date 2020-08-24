require('./db/mongoose')
const path  = require('path')
const express = require('express')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const userRouter = require('./routers/user')
const pagesRouter = require('./routers/pages')
const galleryRouter = require('./routers/gallery')
const exhibitRouter = require('./routers/exhibit')
const reactionRouter = require('./routers/reaction')
const fetch = require("node-fetch") //na potrzeby testow w funkcji main()

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
app.use(exhibitRouter)
app.use(reactionRouter)
app.use(pagesRouter)  //MUSI BYC NA KONCU, BO MA *








//starts a server, makes it listen on a specific port
// its waiting for requests
app.listen(port, ()=>{
	//WONT display in the browser
	console.log("Server is up on port "+port)
}) 

main = ()=>{
	fetch('http://127.0.0.1:3000/exhibits',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			title: 'Bibleee',
			category: 'Book'
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				console.log('main',data.error)
			}else{
				console.log('main', data)
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji main',e)
	})
}

//main()