
p = document.querySelector('#logout_b')
//logout
p.onclick = function (e){ //e event
	//e.preventDefault()

	console.log("HEH")
	
	fetch('/users/logout',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				//message.textContent = data.error
				console.log(data.error)
			}else{
				//message.textContent = 'Logowanko! '+data.user.name
				console.log("wylogowanie")
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji login',e)
	})
	location.reload()
	console.log('riload')
}