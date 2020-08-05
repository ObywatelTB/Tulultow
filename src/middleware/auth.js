const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req,res,next)=>{
	try{
		if(req.header('Authorization'))
			token = req.header('Authorization').replace('Bearer ','')
		if(req.cookies.auth)  //nadpisanie tokena, gdy korzysta sie z przegladarki
			token = req.cookies.auth
		//console.log('autentyk!',token)
		
		const decoded = jwt.verify(token,'thisisasignature') //zwraca token
		const user = await User.findOne({_id: decoded._id, 'tokens.token':token})
		
		if(!user)
			throw new Error()
		
		req.token = token
		req.user = user
		next()
	}catch(e){
		res.render('logged_out',{
			title: "Welcome to the Gallery",
			name: "logged out name"
		})
		// console.log('Brak autoryzacji', e)
		// res.status(401).send({error:'Please authenticate:',e})
		
	}
}

module.exports = auth