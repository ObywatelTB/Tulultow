//drawing the user's gallery
$(document).ready(function(){

const gal_info = $('#browse_info')
const elements_nr = 3  //number of previews visible in one line!
const max_lines_nr = 4 //maximum nr of lines of recommended galleries
var recommended_galleries = []	
var recommended_nr = 0
var users = []  //array of owners of the recommended galleries
var the_chosen_gall = '' //mongodb id of the chosen gallery
var categories = []

//PREVIEWS OF RECOMMENDED
getting_galleries = async()=>{
	//getting the recommended galleries:
	await fetch('/users/me',{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				recommended_galleries = data.recommended_galleries
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
	
}

getting_user = async(gallery_id)=>{
	var new_user = {}
	await fetch('/galleries/owner/'+gallery_id, {method: 'GET'})
		.then( async(response)=>{
			await response.json().then((data)=>{
				if(data.error){
					console.log(data.error)
				}else{
					new_user = data
				}
			})
		}).catch((e)=>{
			console.log('wewnatrz funkcji getting users',e)
		})
	return new_user
}

draw_line = async(iter,r)=>{
	var line = $('<div></div>').attr('class','previews_line')
	
	for(var p=0; p<elements_nr; p++){		//GALLERIES' PREVIEWS
		if(recommended_galleries[iter]){
			div_prev = await draw_preview(iter,p,r)
			line.append(div_prev);
		}
		iter++;
	}

	return line
}

draw_preview = async(iter,c,r)=>{  			//c-column; r-row
	var p1 = $('<p></p>').text(users[iter].name)
	var p2 = $('<p></p>').text(users[iter].city)
	var div_bottom = $('<div></div>')
	div_bottom.append(p1,p2)	
	
	var buffer = await get_avatar(recommended_galleries[iter].gallery)
	var img = $('<img></img>').attr("src",buffer)
	img.attr('class','portrait')
	
	var div_prev = $('<div></div>').attr('class','preview')
	div_prev.attr('id', 'prev_'+r+c)
	div_prev.append(img, div_bottom);	

	return div_prev
}

get_avatar = async(preview_gal_id)=>{
	buff={}
	const user = await getting_user(preview_gal_id)
	const url = '/users/'+user._id+'/avatar'
	
	await fetch(url,{method: 'GET'}).then( async(response)=>{
			await response.arrayBuffer().then((data)=>{
				if(data.error){
					//gal_info.textContent = data.error
					console.log(data.error)
				}else{
					//buff = new Uint8Array( data)
					//var urlCreator = window.URL || window.webkitURL;
					//var buff = urlCreator.createObjectURL( data );
					buff = URL.createObjectURL( new Blob( [data], {type:'image/png'}) );
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get avatar', e)
		})
	return buff
}

preview_style = ()=>{
	$('.preview > div').css({
		'position':'absolute',
		'width': '95%',
		'bottom':  '0',
		'margin-left': 'auto',
		'margin-right': 'auto'
	})
}

previews = async()=>{
	gal_info.text('Take a look at these galleries:')
	$('#browse_butt').hide()
	await getting_galleries()
	
	iter = 0
	while(recommended_galleries[iter]){
		new_user = await getting_user(recommended_galleries[iter].gallery)
		users.push(new_user)
		iter++;
	}
	
	recommended_nr = recommended_galleries.length
	lines_nr = Math.min(Math.floor( recommended_nr / elements_nr), max_lines_nr-1)

	iter = 0
	for(l = 0; l<=lines_nr; l++){
		const line = await draw_line(iter,l);
		iter += elements_nr;
		$('#previews').append(line);
	}
	preview_style()
}


//--------------------------------------------------------------------------

//DISPLAYING GALLERY
draw_gallery = async()=>{
	await get_categories()
	for(var r=0;r<categories.length;r++){	   						//ROOMS
		 await fetch('/exhibits/'+the_chosen_gall+'/'+r,{method: 'GET'}).then( async(response)=>{
			await response.json().then(async(data)=>{
				//console.log(data)
				if(data.error){
					gal_info.textContent = data.error
				}else{
					room = await draw_room(data,r);
					$('#rooms').append(room);
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login', e)
		})
	}
}

get_categories = async()=>{
	await fetch('/galleries/'+the_chosen_gall,{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				categories = data.categories
			}
		}).catch((e)=>{
			console.log('wewnatrz funkcji login',e)
		})
	})
}

draw_room = (data,r)=>{
	var room = $('<div></div>').attr('class','room')
	var title = $('<h2></h2>').text(categories[r]) //name of the room - category
	room.append(title);
	
	for(var e=0; e<data.length; e++){	//EXHIBITS
		div = draw_exhibit(data,r,e)
		room.append(div);
	}
	return room
}

draw_exhibit = (data, r,e)=>{
	var p1 = $('<p></p>').text(data[e].title)
	var p2 = $('<p></p>').text(data[e].content)
	var div = $('<div></div>').attr('class','exhibit')
	//div.attr('id','exhibit_'+r+e)
	
	div.append(p1, p2);	
	
	return div
}


display_gallery = ()=>{
	$('.preview').hover(function (){  	//mouse enters
		const prev_id = $(this).attr('id')
		const row = parseInt(prev_id.slice(-2,-1))
		const col = parseInt(prev_id.slice(-1))
		const index = row*elements_nr + col
		the_chosen_gall = recommended_galleries[index].gallery
		
		$(this).css('cursor', 'pointer');
		$(this).unbind().click(async function(){
			$('#previews').hide()
			await draw_gallery()
			
			const user = await getting_user(the_chosen_gall)
			gal_info.textContent = 'The gallery of '+user.name
			$('#browse_butt').show()
		})
	})
	
	$('#browse_butt').click(function(){
		location.reload(true) 
	})
}




//=====main function
main =  async ()=>{
	//DEALING WITH THE RECOMMENDED LIST
	await previews()
	
	//DISPLAYING ACTUAL GALLERY
	display_gallery()
}

main()
	
});	
