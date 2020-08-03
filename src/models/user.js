const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
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
	tokens: [{
		token:{
			type: String,
			required: true
		}
	}]
})

userSchema.methods.generateAuthToken = async function(){
	const user = this
	const token = jwt.sign({_id: user._id.toString()},'thisisasignature')
	
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

const User = mongoose.model('User',userSchema)

module.exports = User