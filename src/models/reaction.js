
const mongoose = require('mongoose')
const validator = require('validator')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

//an array of reactions for a particular gallery
const reactionSchema = mongoose.Schema({
	reactions: [{
		exhibit:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Exhibit'
		},
		author:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		comment:{
			type: String,
			required: false
		},
		like:{
			type: Boolean,
			required: false
		}
	}],
	gallery:{
		//type: mongoose.Schema.Types.ObjectId, //czyli _id galerii
		type: String,
		required: true,
		ref: 'Gallery'
	}
},{
	timestamps: true
})

const Reaction =  mongoose.model('Reaction', reactionSchema)

module.exports = Reaction
