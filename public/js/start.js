//client-side java script, loggin in
const loginInputEmail = document.querySelector('#input_login_email')
const loginInputPass = document.querySelector('#input_login_pass')
const loginForm = document.querySelector('#form_login')

const signupInputName = document.querySelector('#input_name')
const signupInputEmail = document.querySelector('#input_email')
const signupInputPass = document.querySelector('#input_pass')
const signupIputCity = document.querySelector('#input_city')
const signupInputCountry = document.querySelector('#input_country')
const signupForm = document.querySelector('#form_signup')

const message = document.querySelector('#message')

message.textContent = ''

//signup
signupForm.addEventListener('submit',(e)=>{ //e - event
	e.preventDefault()
	
	const name = signupInputName.value
	const email = signupInputEmail.value
	const password = signupInputPass.value
	const city = signupIputCity.value
	const country = signupInputCountry.value
	
	message.textContent = 'loading'
	console.log('signing')
	
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
				message.textContent = "The account has been created. Welcome, "+data.user.name+'!'
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji login',e)
	})
	location.reload()
})

//login
loginForm.addEventListener('submit',(e)=>{ //e - event
	e.preventDefault()
	
	const email = loginInputEmail.value
	const password = loginInputPass.value
	
	console.log('loggin')
	
	fetch('/users/login',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email,
			password
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				message.textContent = 'Logowanko! '+data.user.name
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji login',e)
	})
	location.reload()
	location.reload()
})

