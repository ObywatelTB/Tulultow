//client-side java script, loggin in

var table = document.getElementById('table');

draw_raw = (data,r)=>{
	var tr = document.createElement('tr');   

	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
	
	var text1 = document.createTextNode(data[r].name);
	var text2 = document.createTextNode(data[r].city +', '+data[r].country);
	var text3 = document.createTextNode(data[r].createdAt);
	td1.appendChild(text1);
	td2.appendChild(text2);
	td3.appendChild(text3);
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	table.appendChild(tr);
}

draw_table = async()=>{
	fetch('/users',{method: 'GET'}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				for (var r = 0; r<data.length; r++){
					draw_raw(data,r)
				}
				document.getElementById('divi').appendChild(table);
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
}


main = async()=>{
	await draw_table()
}

main()
