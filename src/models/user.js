const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Gallery = require('./gallery')
const Exhibit = require('./exhibit')

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		validate(value){
			if(!validator.isEmail(value))
				throw new Error('wrong format of a mail!')
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	administrator: {
		type: Boolean,
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	date_of_birth: {
		type: Date,
		required: false
		//trim: true
	},
	city:{
		type: String,
		required: false,
		default: "let us know"
	},
	country:{
		type: String,
		required: false,
		default: "so where is it?"
	},
	avatar:{
		type: Buffer
	},
	favourite_galleries: [{
		gallery: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		points: {
			type: Number,
			required: false,
			default: 0
		}
	}],
	recommended_galleries: [{
		gallery: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		points: {
			type: Number,
			required: false,
			default: 0
		}
	}],
	tokens: [{
		token:{ //po co jest ta zmienna. do wywalenia
			type: String,
			required: true
		}
	}]
},{
	timestamps: true
})

userSchema.virtual('galleries',{
	ref: 'Gallery',
	localField: '_id',
	foreignField: 'owner'
})

userSchema.methods.createGallery = async function(){
	const user = this
	const gallery = new Gallery({
		categories: [ "Song", "Film" ],
		rooms: {},
		owner: user._id
	})/* 
	const exhibit = new Exhibit({
		title: 'Know your Enemy',
		category: 'Song',
		owner: gallery._id
	}) */
	// gallery['rooms'] = [{room:{category: 'Song', exhibits:[ exhibit._id, exhibit2._id ]  }},
	// {room:{category: 'Film', exhibits:[ exhibit3._id ]  }}]
	gallery['rooms'] = [{room:{category: 'Song' }},
		{room:{category: 'Film' }}]
	await gallery.save()
	// await exhibit.save()
	return gallery
}

userSchema.methods.generateAuthToken = async function(){
	const user = this
	const token = jwt.sign({_id: user._id.toString()},process.env.TOKEN_SECRET)
	
	user.tokens = user.tokens.concat({token})
	await user.save()
	
	return token
}

userSchema.statics.findByCredentials = async(email,password)=>{
	const user = await User.findOne({email})
	
	if(!user)
		throw new Error('unable to loginn')
	
	const isMatch = await bcrypt.compare(password, user.password)
	if(!isMatch)
		throw new Error('unable to loginnn')
	
	return user
}

userSchema.pre('save', async function(next){
	const user = this
	
	if(user.isModified('password')){
		user.password = await bcrypt.hash(user.password, 8)
	}
	
	next()
})

//delete user gallery when user is removed
// userSchema.pre('remove', async function(next){
	// const user = this
	// await Task.deleteMany({ owner: user._id })
	// next()
// })

const User = mongoose.model('User',userSchema)

module.exports = User