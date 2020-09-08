$(document).ready(function(){
	
// var table = document.getElementById('table');
var table = $('#table')

draw_row = (data,r)=>{
	var tr = $('<tr></tr>')
	var td1 = $('<td></td>').text(data[r].name)
	var td2 = $('<td></td>').text(data[r].city +', '+data[r].country)
	var td3 = $('<td></td>')
	
	var butt = $('<button></button>').text('Open').attr('class','button_table')
	td3.append(butt)
	
	tr.append(td1, td2, td3)
	table.append(tr);
}

draw_table = async()=>{
	fetch('/users',{method: 'GET'}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				for (var r = 0; r<data.length; r++){
					draw_row(data,r)
				}
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

})