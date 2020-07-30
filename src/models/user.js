const mongoose = require('mongoose')
const validator = require('validator')

const User = mongoose.model('User',{
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	email: {
		type: String,
		required: false,
		default: "szablon@tlen.pl",
		validate(value){
			if(!validator.isEmail(value))
				throw new Error('wrong format of a mail!')
		}
	}
})

module.exports = User