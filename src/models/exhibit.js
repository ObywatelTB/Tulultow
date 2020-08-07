const mongoose = require('mongoose')
const validator = require('validator')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

const exhibitSchema = mongoose.Schema({
	title:{
		type: String,
		required: true
	},
	content:{
		type: String,
		required: false,
		default: ''
	},
	category:{
		type: String,
		required: true,
		enum:  ['Song', 'Film', 'Book', 'Game', 'Quote', 'Place', 'Person', 'Dish', 'Perfume', 'Invention']
	},
	picture:{ //na razie string, ale potem sie ustawi
		type:String
	},
	owner:{
		type: mongoose.Schema.Types.ObjectId, //czyli chyba _id usera
		required: true,
		ref: 'Gallery'
	}		
},{
	timestamps: true
})

const Exhibit =  mongoose.model('Exhibit', exhibitSchema)

module.exports = Exhibit
