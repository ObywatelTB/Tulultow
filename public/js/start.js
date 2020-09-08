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


upload_avatar = async()=>{
	await fetch('/users/me/avatar_init',{method: 'POST', headers: {'Content-Type': 'application/json'}
		}).then(async(response)=>{
			await response.json().then((data)=>{
				if(data.error){
					console.log(data.error)
				}else{
					console.log('New photo added!')
					//location.reload(true) 
				}
			})
		}).catch((e)=>{
			console.log('wewnatrz funkcji button modal, new avatar',e)
		}) 	
}


//signup
signupForm.addEventListener('submit',async(e)=>{ //e - event
	e.preventDefault()
	
	const name = signupInputName.value
	const email = signupInputEmail.value
	const password = signupInputPass.value
	const city = signupIputCity.value ? signupIputCity.value : undefined
	const country = signupInputCountry.value ? signupInputCountry.value : undefined
	
	message.textContent = 'loading'
	console.log('signing')
	
	fetch('/users',{method: 'POST',headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			name,
			email,
			password,
			administrator: false,
			city,
			country
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				message.textContent = "The account has been created. Welcome, "+data.user.name+'!'
				location.reload() 
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji signup w skrypcie start',e)
	})
	
	//await upload_avatar()
	
	
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
				location.reload(true) 
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji login',e)
	})
})

