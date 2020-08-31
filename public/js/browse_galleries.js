//drawing the user's gallery
$(document).ready(function(){

const gal_info = document.querySelector("#browse_info")
const elements_nr = 5  //number of previews visible in one line!
const max_lines_nr = 3 //maximum nr of lines of recommended galleries
var recommended_galleries = []	
var recommended_nr = 0
var users = []  //array of owners of the recommended galleries
var the_chosen_gall = '' //mongodb id of the chosen gallery
var categories = []

//RECOMMENDED
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


draw_line = (iter,r)=>{
	var line = document.createElement('div')
	line.setAttribute('class','room');
	
	for(var p=0; p<elements_nr; p++){		//GALLERIES' PREVIEWS
		if(recommended_galleries[iter]){
			div1 =  draw_preview(iter,p,r)
		}
		iter++;
		line.appendChild(div1);
	}

	return line
}

draw_preview = (iter,c,r)=>{  			//c-column; r-row
	var p1 = document.createElement('p');
	p1.appendChild(document.createTextNode(users[iter].name))	
	var p2 = document.createElement('p');
	p2.appendChild(document.createTextNode(users[iter].city))
	
	
	var div1 = document.createElement('div');
	div1.setAttribute('class','exhibit');
	div1.setAttribute('id', 'prev_'+r+c);
	div1.appendChild(p1);
	div1.appendChild(p2);
	
	return div1
}


previews = async()=>{
	gal_info.textContent = 'Take a look at these ones:'
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
		const line = draw_line(iter,l);
		iter += elements_nr;
		document.getElementById('previews').appendChild(line);
	}
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
					document.getElementById('rooms').appendChild(room);
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
	var room = document.createElement('div')
	room.setAttribute('class','room');

	var t1 = document.createTextNode(categories[r])
	var e1 = document.createElement('h2');	//name of the room, category
	e1.appendChild(t1) 
	room.appendChild(e1);
	
	for(var e=0; e<data.length; e++){	//EXHIBITS
		div1 = draw_exhibit(data,r,e)
		room.appendChild(div1);
	}
	return room
}

draw_exhibit = (data, r,e)=>{
	var p1 = document.createElement('p');
	p1.appendChild(document.createTextNode(data[e].title))	
	var p2 = document.createElement('p');
	p2.appendChild(document.createTextNode(data[e].content))
	
	var div1 = document.createElement('div');
	div1.setAttribute('class','exhibit');
	//div1.setAttribute('id','exhibit_'+r+e)
	div1.appendChild(p1);
	div1.appendChild(p2);
	
	return div1
}


display_gallery = ()=>{
	$('.exhibit').hover(function (){  	//mouse enters
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
