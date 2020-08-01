//client-side java script, loggin in

const loginInputName = document.querySelector('#input_name')
const loginInputEmail = document.querySelector('#input_email')
const loginInputPass = document.querySelector('#input_pass')
const loginIputCity = document.querySelector('#input_city')
const loginInputCountry = document.querySelector('#input_country')
const loginForm = document.querySelector('form')
const message = document.querySelector('#message')

message.textContent = ''

loginForm.addEventListener('submit',(e)=>{ //e - event
	e.preventDefault()
	
	const name = loginInputName.value
	const email = loginInputEmail.value
	const password = loginInputPass.value
	const city = loginIputCity.value
	const country = loginInputCountry.value
	
	message.textContent = 'loading'
	
	
	fetch('/users',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name,
			email,
			password,
			city,
			country
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				message.textContent = "The account has been created. Welcome, "+data.name+'!'
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
})