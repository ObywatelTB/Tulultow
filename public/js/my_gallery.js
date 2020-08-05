
const gal_info = document.querySelector("#gal_info")

gal_info.textContent = 'hejo'


fetch('/galleries/me',{method: 'GET'}).then((response)=>{
	response.json().then((data)=>{
		if(data.error){
			gal_info.textContent = data.error
		}else{
			gal_info.textContent = "One of categories: "+ data[0].categories[0].category
		}
	})
}).catch((e)=>{
	console.log('wewnatrz funkcji login',e)
})