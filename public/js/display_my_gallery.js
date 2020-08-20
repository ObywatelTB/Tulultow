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
var exhibits_ids = [];			//used while deleting exhibits

var buttons_count = 0
var buttons_array = []


//=====drawing the rooms
draw_room = (data,r)=>{
	var t1 = document.createTextNode(categories[r])//data[0].category)
	
	var room = document.createElement('div')
	room.setAttribute('class','room');
	 
	var e1 = document.createElement('h2');	//name of the room, category
	e1.appendChild(t1) 
	room.appendChild(e1);
	
	var ids_arr = []
	for(var e=0; e<data.length; e++){	//EXHIBITS
		//console.log(data[e]._id)
		ids_arr.push(data[e]._id)

		var p1 = document.createElement('p');
		p1.appendChild(document.createTextNode(data[e].title))
		
		var p2 = document.createElement('p');
		p2.appendChild(document.createTextNode(data[e].content))
		
		var iks = document.createElement('span');
		iks.setAttribute('class','delete');
		iks.setAttribute('id','delete_'+r+e) //eg: delete_21
		iks.appendChild(document.createTextNode('×'))
		
		var div1 = document.createElement('div');
		div1.setAttribute('class','exhibit');
		div1.setAttribute('id','exhibit_'+r+e)
		div1.appendChild(iks);
		div1.appendChild(p1);
		div1.appendChild(p2);
		
		room.appendChild(div1);
	}
	exhibits_ids[r] = ids_arr
	if( data.length<5 || Object.keys(data).length===0 ){ 	//button
		var butt = document.createElement('button');
		butt.setAttribute('class','exhibit')
		butt.setAttribute('id','button_'+r)
		butt.appendChild(document.createTextNode('Add New '+ categories[r]))
		room.appendChild(butt)
		
		buttons_count += 1
		buttons_array.push(butt)
		new_ex_cats.push(categories[r])
	}
	return room
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
					document.getElementById('rooms').appendChild(room);
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login', e)
		})
	}
	buttons_array.push(document.querySelector("#new_cat_butt"))
	$('.room').css('margin-bottom','60px')
}

//=====modal (adding exhibit)
create_modal = async()=>{
	var span = document.getElementsByClassName("close")[0];
	
	//opening the modal
	for(var i=0; i<buttons_array.length; i++){
		// console.log('r',buttons_array[i].id)
		buttons_array[i].onclick = function(){
			var ii = buttons_array.indexOf(this) //bo 'i' przestaje dzialac chyba przez asynchronicznosc
			$("#myModal").css("display", "block");	
			
			if(buttons_array[ii].id != 'new_cat_butt'){		//new exhibit
				$('#modal_p').text( 'Lets add a new '+ new_ex_cats[ii]+ ' exhibit.' )
				$('#input_content').show()
				$('#form_modal button').text('Add exhibit!')
				new_exhibit_category = new_ex_cats[ii] //potrzebne przy wysylaniu requesta
			}else{											//new category
				$('#modal_p').text( 'Lets add a new Category.' )
				$('#input_content').hide()
				$('#form_modal button').text('Add category')
				new_exhibit_category = ''
			}
		} 
	}
	
	//closing the modal
	span.onclick = function() {
		$("#myModal").css("display", "none");
	}
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
		
		const title = input_title.value
		new_category = title
		const content = input_content.value
		
		if(new_exhibit_category){				//adding exhibit
			console.log('adding exhibit', new_exhibit_category)
			
			fetch('/exhibits',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title,
				content,
				category: new_exhibit_category 
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
		}else{									//adding category
			console.log('adding category', new_category)
			
			fetch('/galleries/category',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				category: new_category 
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
	
	$('.delete').click(function(){
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
