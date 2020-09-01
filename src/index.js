const app = require('./app')

const port = process.env.PORT

//starts a server, makes it listen on a specific port
// its waiting for requests
app.listen(port, ()=>{
	console.log("Server is up on port "+port)
}) 