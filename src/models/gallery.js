const mongoose = require('mongoose')
const validator = require('validator')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

const gallerySchema = mongoose.Schema({
	categories: [{
		category:{
			type: String,
			required: true,
			//unique: true,
			enum: ['Song', 'Film', 'Book', 'Game', 'Quote', 'Place', 'Person', 'Dish', 'Perfume', 'Invention']
		}
	}], 
	rooms: [{
		room:[{
			position:{ //na razie tylko w formie stringa z nazwa
				type: String
				//required: true,
				//unique: true
			}
		}]
	}],
	owner:{
		type: mongoose.Schema.Types.ObjectId, //czyli chyba _id usera
		required: true,
		ref: 'User'
	}		
},{
	timestamps: true
})

const Gallery =  mongoose.model('Gallery',gallerySchema)

module.exports = Gallery