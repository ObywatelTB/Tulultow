//client-side java script, loggin in
//const mongoose = require('mongoose')

//var table = document.createElement('table')
var table = document.getElementById('table');

_id = "5f2056b3988ca72960b48ad9";

fetch('/users',{method: 'GET'}).then((response)=>{
	response.json().then((data)=>{
		if(data.error){
			message.textContent = data.error
		}else{
			for (var i = 0; i < 5;i++){
				var tr = document.createElement('tr');   

				var td1 = document.createElement('td');
				var td2 = document.createElement('td');
				var td3 = document.createElement('td');
				
				var text1 = document.createTextNode(data[i].name);
				var text2 = document.createTextNode(data[i].city +', '+data[i].country);
				var text3 = document.createTextNode(data[i].password);
				td1.appendChild(text1);
				td2.appendChild(text2);
				td3.appendChild(text3);
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				table.appendChild(tr);
			}
		}
	})
}).catch((e)=>{
	console.log(e)
})

document.getElementById('table').appendChild(table);
//document.body.appendChild(table);

/* 
loginForm.addEventListener('submit',(e)=>{ //e - event
	e.preventDefault()
	
	fetch('/users',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			
		})
	}).then(()=>{
		
	}).catch((e)=>{
		console.log(e)
	}) 
})
*/
