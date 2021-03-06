//client-side java script, weather

const weatherForm = document.querySelector('form')
const search = document.querySelector('input')
const messageOne = document.querySelector('#message-1')
const messageTwo = document.querySelector('#message-2')

//messageOne.textContent = 'From javascript'


weatherForm.addEventListener('submit',(e)=>{
	e.preventDefault() //browser wont refresh
	
	const location = search.value
	
	messageOne.textContent = 'loading...'
	messageTwo.textContent = ''
	
	
	fetch('/w?address='+location).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				messageOne.textContent = data.error
			}else{
				messageOne.textContent = data.location
				messageTwo.textContent = data.forecast
			}
		})
	})
})

