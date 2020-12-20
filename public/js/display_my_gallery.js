//drawing the user's gallery
$(document).ready(function(){
	
const gal_info = document.querySelector("#gal_info")
// gal_info.textContent = '...'
var new_ex_form = document.querySelector('#form_modal')
var input_title = document.querySelector('#input_title')
var input_content = document.querySelector('#input_content')

//var rooms_count = 0
var categories = []				//all c. stored in gallery.categories
var new_ex_cats = [] 			//new-exhibit categories
var new_exhibit_category = ''
var new_category = ''			//while creating new category
var exhibits_ids = []			//used while deleting exhibits

var buttons_count = 0
var buttons_array = []

//Mustache Templates
exhibit_template = $('#exhibit-template').html()

//=====drawing the rooms
draw_room = (data,r)=>{	
	var room = $('<div></div>').attr('class','room');
	var room_title = $('<h2></h2>').text(categories[r]);
		
	room.append(room_title);
	
	var ids_arr = []
	for(var e=0; e<data.length; e++){	//EXHIBITS
		ids_arr.push(data[e]._id)
		
		const html = Mustache.render(exhibit_template,{
			exhibit_id:		'exhibit_'+r+e,
			span_id:		'delete_'+r+e,
			img_src:		process_img_buffer(data[e].picture),
			prev_title:		data[e].title,
			prev_title2: 	data[e].content
		})
		
		room.append(html);
	}
	exhibits_ids[r] = ids_arr
	if( data.length<5 || Object.keys(data).length===0 ){ 	//button
		var butt = $('<button></button>').text('Add New '+ categories[r])
		butt.attr('class','exhibit').attr('id','button_'+categories[r])
		
		room.append(butt)
		
		buttons_count += 1
		buttons_array.push(butt)
		new_ex_cats.push(categories[r])
	}
	return room
}

process_img_buffer = (pic)=>{
	source = ''
	if(pic){
		b64 = btoa(
			pic.data.reduce((data,byte)=> data+ String.fromCharCode(byte),'')
		)
		source = 'data:image/png;base64,' + b64
	}
	return source
}

draw_gallery = async()=>{
	for(var r=0;r<categories.length;r++){	   						//ROOMS
		 await fetch('/exhibits/'+r,{method: 'GET'}).then( async(response)=>{
			await response.json().then(async(data)=>{
				//console.log(data)
				if(data.error){
					gal_info.textContent = data.error
				}else{
					const room = await draw_room(data,r);
					$('#rooms').append(room);
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login', e)
		})
	}
	buttons_array.push($("#new_cat_butt"))
}

//=====modal (adding exhibit)
create_modal = async()=>{
	const span = $("#close_modal")
		
	//opening the modal
	for(var i=0; i<buttons_array.length; i++){
		// console.log('r',buttons_array[i].id)
		buttons_array[i].on('click', function(){
			$("#myModal").css("display", "block");
			
			const butt_id = $(this).attr('id')
			const cat = butt_id.replace('button_','')
			
			if( butt_id != 'new_cat_butt'){
				$('#modal_p').text( 'Lets add a new '+ cat + ' exhibit.' )
				$('#input_content').show()
				$('#input_comboBox').hide()
				$('#form_modal button').text('Add exhibit!')
				new_exhibit_category = cat //potrzebne przy wysylaniu requesta
			}else{											//new category
				$('#modal_p').text( 'Lets add a new Category.' )
				$('#input_title').hide()
				$('#input_comboBox').show()
				$('#input_content').hide()
				$('#form_modal button').text('Add category')
				new_exhibit_category = ''
			}
		})
	}
	
	//closing the modal
	span.on('click', function() {
		$("#myModal").css("display", "none");
	})
	
	//troche slabo bo 2 konwencje, jQuery i ponizsza. ale wazne ze dziala!
	var myM = document.querySelector('#myModal')
	window.onclick = function(event) {
		if (event.target == myM) {
			myM.style.display = "none" ;
		}
	}
}

handle_modal_button = async()=>{
//this function joins both new exhibit and new category, cz. both use the same modal
	new_ex_form.addEventListener('submit',(e)=>{ //po wcisnieciu buttona w modalu
		e.preventDefault()
		
		title = input_title.value
		new_cat = input_comboBox.value
		content = input_content.value
		
		if(new_exhibit_category){				//adding exhibit
			console.log('adding exhibit', new_exhibit_category)
			add_exhibit_request(title, content)			
		}else{									//adding category
			console.log('adding category', new_category)
			add_category_request(new_cat)		
		}
	})	
}


/* get_avatar = async(exhibit_id)=>{
	buff={}
	//const exhibit = //await getting_user(preview_gal_id)
	const url = '/exhibits/'+exhibit_id+'/pic'
	
	await fetch(url,{method: 'GET'}).then( async(response)=>{
			await response.arrayBuffer().then((data)=>{
				if(data.error){
					//gal_info.textContent = data.error
					console.log(data.error)
				}else{
					buff = URL.createObjectURL( new Blob( [data], {type:'image/png'}) );
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get avatar', e)
		})
	return buff
} */

/* upload_avatar = async(file)=>{
	const formData = new FormData();
	formData.append('avatar', file);
	
	fetch('/users/me/avatar',{method: 'POST',
		body: formData
	}).then( (response)=>{
		response.arrayBuffer().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				console.log("dodano pliczek,", data)
			}
		})
	}).catch((e)=>{
		console.log('blad wewnatrz funkcji get avatar', e)
	})
} */



add_exhibit_request = (title, content)=>{
	const buffer = ''
	
	fetch('/exhibits',{ method: 'POST', headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			title,
			content,
			category: new_exhibit_category//,
			//picture: buffer
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				gal_info.textContent = data.error
			}else{
				gal_info.textContent = 'New element! '
				location.reload(true) 
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji new exhibit',e)
	})
}

add_category_request = (new_cat)=>{
	fetch('/galleries/category',{method: 'POST',headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			category: new_cat 
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				gal_info.textContent = data.error
			}else{
				gal_info.textContent = 'New element! '
				location.reload(true) 
			}
		})
	}).catch((e)=>{
		console.log('wewnatrz funkcji new exhibit',e)
	})
}

handle_exhibit_deletion = async()=>{
	$('.exhibit').hover(function(){  	//mouse enters
		const ex_id = $(this).attr('id')
		const room_nr = 	ex_id.slice(-2,-1)
		const exhibit_nr =  ex_id.slice(-1)
		var del_id = '#delete_'+room_nr+exhibit_nr
		$(del_id).css( "display", "inline" )
	}, function(){						//mouse leaves
		const ex_id = $(this).attr('id')
		const room_nr = 	ex_id.slice(-2,-1)
		const exhibit_nr =  ex_id.slice(-1)
		var del_id = '#delete_'+room_nr+exhibit_nr
		$(del_id).css( "display", "none" )
	})
	
	$('.delete_exhibit').click(function(){
		const button_id = $(this).attr('id');
		const room_nr = button_id.slice(-2,-1)
		const exhibit_nr = button_id.slice(-1)
		var _id = exhibits_ids[room_nr][exhibit_nr]
		console.log(_id)
		
		fetch('/exhibits/'+ _id,{
		method: 'DELETE'}).then((response)=>{
			response.json().then((data)=>{
				if(data.error){
					//gal_info.textContent = data.error
				}else{
					//gal_info.textContent = 'New element! '
					console.log('element deleted')
					location.reload(true) 
				}
			})
		}).catch((e)=>{
			console.log('wewnatrz funkcji new exhibit',e)
		})
	})
}


//=====main function
main =  async ()=>{
	Mustache.tags = ["[[", "]]"];
	
	//getting the nr of rooms:
	await fetch('/galleries/me',{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				categories = data[0].categories
			}
		}).catch((e)=>{
			console.log('wewnatrz funkcji login',e)
		})
	})
	
	//drawing the gallery:
	await draw_gallery()
	
	//draw and use modals (adding exhibits):
	create_modal()
	handle_modal_button()
	handle_exhibit_deletion()
}

main()
	
});	
