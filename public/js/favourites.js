$(function(){
	
// var table = document.getElementById('table');
var table = $('#table')
var galleries = []

draw_table = async()=>{
	await get_galleries()
	users = []
	await fetch('/users',{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				for (var r = 0; r<data.length; r++){
					draw_row(data,r)
					users = data
				}
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
	return users
}

get_galleries = async()=>{
	await fetch('/users/galleries',{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				message.textContent = data.error
			}else{
				galleries = data
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
}

draw_row = (data,r)=>{
	var tr = $('<tr></tr>')
	var td1 = $('<td></td>').text(data[r].name)
	var td2 = $('<td></td>').text(data[r].city +', '+data[r].country)
	var td3 = $('<td></td>')
	
	var butt = $('<button></button>').text('Open').attr('class','button_table')
	if(galleries[r][0]){
		butt.attr('id',`butt_${r}`)
		butt.css('background-color','rgb(253, 228, ' + parseInt(255-r*10) +')' )
		td3.append(butt)
	}
	tr.append(td1, td2, td3)
	table.append(tr);
}

handle_open_buttons = (users) => {
	$('.button_table').on('click',function(){
		ind = this.id.split("_")[1] //gives a number after _ symbol
		if(galleries[ind][0]){
			gallery_id = galleries[ind][0]._id
			location.replace('/browse_galleries/'+ gallery_id);
		}
	})
}


main = async()=>{
	users = await draw_table()
	handle_open_buttons(users)
}

main()

})