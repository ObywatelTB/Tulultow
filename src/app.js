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
const fetch = require("node-fetch") //only for the tests in the main() function

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

const app = express()

//Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.use(express.json()) //important line
app.use(cookieParser())
app.use(userRouter)
app.use(galleryRouter)
app.use(exhibitRouter)
app.use(reactionRouter)
app.use(pagesRouter)  //IT HAS TO BE AT THE END, CZ IT HAS *


module.exports = app