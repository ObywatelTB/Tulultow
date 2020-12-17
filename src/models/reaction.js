
const mongoose = require('mongoose')
const validator = require('validator')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

//an array of reactions for a particular gallery
const reactionSchema = mongoose.Schema({
	likes: [{	//if there's a record it means the author (of reaction) gave a like
		exhibit_id:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Exhibit'
		},
		author_id:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		author_name:{
			type: String,
			required: true
		}
	}],
	comments: [{
		exhibit_id:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Exhibit'
		},
		author_id:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		author_name:{
			type: String,
			required: true
		},
		comment_content:{
			type: String,
			required: true
		}
	}],
	gallery_id:{
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
