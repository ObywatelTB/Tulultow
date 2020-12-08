//drawing the user's gallery
// $(document).ready(function(){


const gal_info = $('#browse_info')
const elements_nr = 3  //number of previews visible in one line!
const max_lines_nr = 4 //maximum nr of lines of recommended galleries
var recommended_galleries = []	
var recommended_nr = 0
var users = []  //array of owners of the recommended galleries
//var the_chosen_gal  //mongodb id of the chosen gallery
var categories = []
var input_content = document.querySelector('#input_comment')
var modal_return_id = 0
var like_click_id = 0 //?
var exhibits_ids = []

//Mustache templates
exhibit_template = $('#exhibit-template').html()
modal_inner_template = $('#modal-inner-template').html()

$(function(){


//--------------------------------------------------------------------------

//DISPLAYING GALLERY
draw_gallery = async()=>{
	await get_categories()
	for(var r=0;r<categories.length;r++){	   						//ROOMS
		 await fetch('/exhibits/'+ the_chosen_gal +'/'+r,{method: 'GET'}).then( async(response)=>{
			await response.json().then(async(data)=>{
				if(data.error){
					gal_info.textContent = data.error
				}else{
					room = await draw_room(data,r);
					$('#rooms').append(room);
					handle_comment();
					handle_like();
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login', e)
		})
	}
}

get_categories = async()=>{
	await fetch('/galleries/'+the_chosen_gal,{method: 'GET'}).then( async(response)=>{
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
	
	var ex_ids_row = []
	for(var e=0; e<data.length; e++){	//EXHIBITS
		ex_ids_row.push(data[e]._id)
		//exhibits_ids[r].push(data[e]._id) 

		div = draw_exhibit(data,r,e)
		room.append(div);
	}
	exhibits_ids[r] = ex_ids_row

	return room
}

draw_exhibit = (data, r,e)=>{
	const ex = Mustache.render(exhibit_template, {
		img_src:		process_img_buffer(data[e].picture),
		prev_title: 	data[e].title,
		prev_title2:	data[e].content,
		exhibit_id:		'exhibit_'+r+e,
		like_nr:		data[e].likes
	})
	return ex
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



handle_comment = ()=>{
	exhibit_id = ''
	$('.exhibit_comment').hover(function(){
		$(this).css('cursor', 'pointer');
	})
	const span = $("#close_modal")
		
	//opening comment modal
	$('.exhibit_comment').unbind('click').on('click', async function(){ 
		$("#myModal2").css("display", "block");
		const room_nr = 	this.id.slice(-2,-1)
		const exhibit_nr =  this.id.slice(-1)
		const gallery_id = the_chosen_gal
		const exhibit_id = exhibits_ids[room_nr][exhibit_nr]

		comments_ar = await get_comments(gallery_id,exhibit_id)
		// comments_ar = comments_ar.map((c)=>{
		// 	return {comment_content: c.comment_content}
		// })
		
		
		in_mod = Mustache.render(modal_inner_template, {
			comments: comments_ar
		})
		$("#scroll_obj").replaceWith(in_mod) //shows comments

		handle_comment_modal_button(exhibit_id)
		handle_comment_modal_deletion(comments_ar)
	})	
	
	//closing the modal
	span.on('click', function() {
		$("#myModal2").css("display", "none");
	})

	//troche slabo bo 2 konwencje, jQuery i ponizsza. ale wazne ze dziala!
	var myM = document.querySelector('#myModal2')
	window.onclick = function(event) {
		if (event.target == myM) {
			myM.style.display = "none" ;
		}
	}
}

handle_comment_modal_deletion = async(comments_ar)=>{
	$('.scrollmenu_p').hover(function(){  	//mouse enters
		var ex_id = $(this).attr('id')
		var del_id = '#'+ ex_id.substring(2)
		var index_of_comment=0;
		for(var i =0;i < comments_ar.length;i++)
		{
			if(comments_ar[i]._id.toString() ==  ex_id.substring(2))
			{
				index_of_comment=i;
				console.log("foud it!!!")
			}

		}
		console.log(comments_ar[index_of_comment].author_id)
		if(comments_ar[index_of_comment].author_id.toString() == '000000000000000000000001')
		 	$(del_id).css( "display", "inline" )

	}, function(){						//mouse leaves
		var ex_id = $(this).attr('id')
		var del_id = '#'+ ex_id.substring(2)
		$(del_id).css( "display", "none" )
	})
}



handle_comment_modal_button = (exhibit_id)=>{
	//this function joins both new exhibit and new category, cz. both use the same modal
	$("#form_modal").unbind('submit').bind("submit",  function(e){
		e.preventDefault()
		comment_txt = input_content.value
		submit_comment(comment_txt, exhibit_id)
		$("#myModal2").css("display", "none");
	})	
}

//BACKEND_(comments)_________________________________________
get_comments = async(gallery_id, exhibit_id)=>{
	//getting the comments of an exhibit:
	comments = []
	await fetch('/reactions/'+gallery_id+'/'+exhibit_id,{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				//console.log('dostalem komentarze, to one: ',data)
				comments = data
			}
		})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get comments', e)
		})
	return comments
}

submit_comment = (comment_txt, exhibit_id)=>{
	fetch('/reactions/comment',{method: 'POST',headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			gallery_id: the_chosen_gal,
			exhibit_id: exhibit_id,
			comment_content: comment_txt
		})
	}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				//gal_info.textContent = data.error
			}else{
				//gal_info.textContent = 'New element! '
				console.log('Comment submitted! comm:')
				//location.reload(true) 
			}
		})
	}).catch((e)=>{
		console.log('ERROR in the funciton Submit comment',e)
	})
}

delete_comment = (gallery_id, comment_id)=>{
	fetch('/reactions/comment/'+ gallery_id + '/' + comment_id, {method: 'DELETE'}).then((response)=>{
		response.json().then((data)=>{
			if(data.error){
				//gal_info.textContent = data.error
			}else{
				//gal_info.textContent = 'New element! '
				console.log('Comment deleted')
				//location.reload(true) 
			}
		})
	}).catch((e)=>{
		console.log('ERROR in the comment deletion fetch function (delete_comment)',e)
	})
}
//___________________________________________________________

handle_like = ()=>{
	$('.exhibit_like').hover(function(){
		$(this).css('cursor', 'pointer');
	})

	 $('.exhibit_like').unbind('click').on('click', async function(){
		const room_nr = 	this.id.slice(-2,-1)
		const exhibit_nr =  this.id.slice(-1)
		const exhibit_id = exhibits_ids[room_nr][exhibit_nr]

		likes_count = await submit_like(exhibit_id)

		//$('this')
		//TUTAJ MA BYC ZMIANA WYSWIETLANIA IKONY I LICZBY
	  	document.getElementById(this.id).like_nr = likes_count
		document.getElementById(this.id).innerHTML = document.getElementById(this.id).like_nr;

	 })
}

//BACKEND_(likes)____________________________________________
submit_like = async(exhibit_id)=>{
	likes_count = 0
	await fetch('/reactions/switch_like',{method: 'POST',headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			gallery_id: the_chosen_gal,
			exhibit_id: exhibit_id
		})
	}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				//gal_info.textContent = data.error
			}else{
				//gal_info.textContent = 'New element! '
				console.log('Switched like! nr:', data.likes)
				likes_count = data.likes
			}
		})
	}).catch((e)=>{
		console.log('ERROR in the funciton Submit comment',e)
	})
	return likes_count
}
//_BACKEND, user__________________________________________________________
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
//___________________________________________________________

exhibit_hover = ()=>{ //can be used to display like and comment icons
	$('.exhibit').hover(function(){  	//mouse enters
		// const ex_id = $(this).attr('id')
		// const room_nr = 	ex_id.slice(-2,-1)
		// const exhibit_nr =  ex_id.slice(-1)
		// var del_id = '#delete_'+room_nr+exhibit_nr
		// $(del_id).css( "display", "inline" )
	}, function(){						//mouse leaves
		// const ex_id = $(this).attr('id')
		// const room_nr = 	ex_id.slice(-2,-1)
		// const exhibit_nr =  ex_id.slice(-1)
		// var del_id = '#delete_'+room_nr+exhibit_nr
		// $(del_id).css( "display", "none" )
	})
}



display_gallery = async() =>{
	await draw_gallery()
	exhibit_hover()

	const user = await getting_user(the_chosen_gal)
	gal_info.text( 'The gallery of ' + user.name)
	if (categories.length == 0){
		$('#main-content').append('<h3>Apparently this user\'s gallery is empty!</h3>')
	}
	
	$('#browse_butt').show()	
	$('#browse_butt').on('click',function(){
		location.reload(true) 
	})
}


//=====main function
main =  async ()=>{
	Mustache.tags = ["[[", "]]"];
	
	//DISPLAYING ACTUAL GALLERY
	display_gallery()
}

main()
	
});	
