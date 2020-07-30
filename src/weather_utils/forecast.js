const request = require('request')

 const forecast = (lat,lon,callback) =>{
	const url = 'http://api.weatherstack.com/current?access_key=088b474f0c326555aeb1893c492e35e8&query='+lat+','+lon//+'&units=s'
	request({url, json:true},(error,{body})=>{
		if(error){
			callback('not able to connect to weather thingy')
		} else if(body.error) {
			callback('not able to get data')
		} else{
			const te = body.current.temperature
			const fl = body.current.feelslike
			const dd = body.current.weather_descriptions[0]
			callback(undefined, dd+". It is currently "+te+" degrees C. "+
			"It feels like "+fl+" degrees C.")
		}
	})
}


module.exports = forecast