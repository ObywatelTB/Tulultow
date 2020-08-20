
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
		conment:{
			type: String,
			required: false
		},
		like:{
			type: Boolean,
			required: false
		}
	}],
	owner:{
		type: mongoose.Schema.Types.ObjectId, //czyli _id galerii
		required: true,
		ref: 'Gallery'
	}
},{
	timestamps: true
})

const Reaction =  mongoose.model('Reaction', reactionSchema)

module.exports = Reaction
