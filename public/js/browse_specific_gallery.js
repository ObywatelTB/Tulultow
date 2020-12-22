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
var exhibits_liked_by_this_user = []

//Mustache templates
exhibit_template = $('#exhibit-template').html()
modal_inner_template = $('#modal-inner-template').html()

$(function(){


//--------------------------------------------------------------------------

//DISPLAYING GALLERY
draw_gallery = async()=>{
	await get_categories()
	await get_liked_exhibits()
	for(var r=0;r<categories.length;r++){	   						//ROOMS
		 await fetch('/exhibits/'+ the_chosen_gal +'/'+r,{method: 'GET'}).then( async(response)=>{
			await response.json().then(async(data)=>{
				if(data.error){
					gal_info.textContent = data.error
				}else{
					room =  await draw_room(data,r);
					$('#rooms').append(room);	
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login', e)
		})
	}
}

//BACKEND___________________________________________
get_categories = async()=>{
	await fetch('/galleries/'+the_chosen_gal,{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				categories = data.categories
			}
		}).catch((e)=>{
			console.log('ERROR in get_categories function',e)
		})
	})
}

get_liked_exhibits = async()=>{
	await fetch('/reactions/likes/'+the_chosen_gal,{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				exhibits_liked_by_this_user = data
			}
		}).catch((e)=>{
			console.log('ERROR in get_liked_exhibits function',e)
		})
	})
}

draw_room = async(data,r)=>{
	var room = $('<div></div>').attr('class','room')
	var title = $('<h2></h2>').text(categories[r]) //name of the room - category
	room.append(title);
	
	var ex_ids_row = []
	for(var e=0; e<data.length; e++){	//EXHIBITS
		ex_ids_row.push(data[e]._id)
		//exhibits_ids[r].push(data[e]._id) 

		div = await draw_exhibit(data,r,e)
		room.append(div);
	}
	exhibits_ids[r] = ex_ids_row

	return room
}

draw_exhibit = async(data, r,e)=>{
	likes_authors = await get_likes(the_chosen_gal, data[e]._id)
	like_img_src = ''
	if(exhibits_liked_by_this_user.length &&
	 exhibits_liked_by_this_user.includes(data[e]._id)){
		like_img_src = '/img/like_text1.png'
	}else{
		like_img_src = '/img/like_text0.png'
	}
	
	const ex = Mustache.render(exhibit_template, {
		img_src:		process_img_buffer(data[e].picture),
		prev_title: 	data[e].title,
		prev_title2:	data[e].content,
		exhibit_id:		'exhibit_'+r+e,
		reaction_id:	'reaction_'+r+e,
		like_id:		'like'+r+e,
		like_img_source: like_img_src,
		like_nr:		data[e].likes,
		comment_id:		'comment_'+r+e,
		likes_givers:	likes_authors
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


//_COMMENTS__________________________________________________
handle_comment = ()=>{
	exhibit_id = ''
	$('.exhibit_comment').hover(function(){
		$(this).css('cursor', 'pointer');
	})
	const span = $("#close_modal")
		
	//opening comment modal. displaying comments
	$('.exhibit_comment').unbind('click').on('click', async function(){ 
		$("#myModal2").css("display", "block");
		const room_nr = 	this.id.slice(-2,-1)
		const exhibit_nr =  this.id.slice(-1)
		const gallery_id = the_chosen_gal
		const exhibit_id = exhibits_ids[room_nr][exhibit_nr]

		comments_ar = await get_comments(gallery_id,exhibit_id)

		var options = { hour: 'numeric', minute: 'numeric',weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
		comments_ar.map(el=>{ 	//getting the date from comment's _id
			timestamp = el._id.toString().substring(0,8)
			timestamp = new Date(parseInt(timestamp, 16)*1000)
			el.date = timestamp.toLocaleDateString("en-GB", options)
		})
		console.log('comments:',comments_ar)
		in_mod = Mustache.render(modal_inner_template, {
			comments_data: comments_ar
		})
		$("#scroll_obj").replaceWith(in_mod) //shows comments

		handle_comment_submit_button(exhibit_id)
		handle_comment_deletion(comments_ar)
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

handle_comment_submit_button = (exhibit_id)=>{
	//this function joins both new exhibit and new category, cz. both use the same modal
	$("#form_modal").unbind('submit').bind("submit",  function(e){
		e.preventDefault()
		comment_txt = input_content.value
		submit_comment(comment_txt, exhibit_id)
		$("#myModal2").css("display", "none");
	})	
}

handle_comment_deletion = async(comments_ar)=>{
	const gallery_id = the_chosen_gal

	$('.scrollmenu_p').on('mouseenter',async function(){  	//mouse enters
		var ex_id = $(this).attr('id')
		var del_id = '#'+ ex_id.substring(2)

		var comment_ind=0
		comments_ar.map((el,ind)=>{
			if(el._id.toString() == ex_id.substring(2))
			comment_ind = ind
		})

		logged_user_id = await get_loggedin_name()
		if(comments_ar[comment_ind].author_id.toString() == logged_user_id)
		{
		 	$(del_id).css( "display", "inline" )
		}
		//deleting the comment
		$(del_id).unbind('click').on('click', async function(){
			await delete_comment(gallery_id, comments_ar[comment_ind]._id)
			$("#myModal2").css("display", "none");
		})
	}).on('mouseleave', function(){						//mouse leaves
		var ex_id = $(this).attr('id')
		var del_id = '#'+ ex_id.substring(2)
		$(del_id).css( "display", "none" )
	})
}

//BACKEND_(comments)_________________________________________
get_comments = async(gallery_id, exhibit_id)=>{
	//getting the comments of an exhibit:
	comments = []
	await fetch('/reactions/comments/'+gallery_id+'/'+exhibit_id,{method: 'GET'}).then(async(response)=>{
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

get_loggedin_name = async()=>{
	//getting the name of the logged in user:
	user_id = ''
	await fetch('/users/logged_name', {method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				user_id = data._id
			}
		})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get_loggedin_name', e)
		})
	return user_id
}

delete_comment = async(gallery_id, comment_id)=>{
	await fetch('/reactions/comment/'+ gallery_id + '/' + comment_id, {method: 'DELETE'}).then(async(response)=>{
		await response.json().then((data)=>{
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


//_LIKES_____________________________________________________
handle_like = ()=>{
	$('.exhibit_like').hover(function(){
		$(this).css('cursor', 'pointer');
	})

	$('.exhibit_like').unbind('click').on('click', async function(){
		const room_nr = 	this.id.slice(-2,-1)
		const exhibit_nr =  this.id.slice(-1)
		const exhibit_id = exhibits_ids[room_nr][exhibit_nr]

		likes_count = await submit_like(exhibit_id)
		$(this).siblings('.exhibit_reaction').children("p").text(likes_count)

		//Changing the like icon
		if(exhibits_liked_by_this_user.length &&
		 exhibits_liked_by_this_user.includes(exhibit_id)){ //now disliked
			exhibits_liked_by_this_user.pop(exhibit_id)
			$(this).attr("src","/img/like_text0.png")
		}else{ //now liked
			exhibits_liked_by_this_user.push(exhibit_id)
			$(this).attr("src","/img/like_text1.png")
		}
		
		//updating the likes' givers list
		$(this).siblings('.exhibit_reaction').children(".dropdown-content").text('')
		likes_authors = await get_likes(the_chosen_gal, exhibit_id)
		likes_authors.map(l_author=>{
			$(this).siblings('.exhibit_reaction').children(".dropdown-content").append('<p>'+l_author+'</p>')
		})
		//console.log('elo',aj)
	})
}

//BACKEND_(likes)____________________________________________
get_likes = async(gallery_id, exhibit_id)=>{
	//used in   draw_exhibit()
	//getting the likes of an exhibit:
	comments = []
	await fetch('/reactions/likes/'+gallery_id+'/'+exhibit_id,{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				//console.log('i got likes, here they are: ',data)
				comments = data
			}
		})
		}).catch((e)=>{
			console.log('error in the function get likes', e)
		})
	return comments
}
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
				//
			}else{
				likes_count = data.likes
			}
		})
	}).catch((e)=>{
		console.log('ERROR in the funciton Submit comment',e)
	})
	return likes_count
}
//_BACKEND, user (author of the gallery)_____________________
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



display_gallery = async() =>{
	await draw_gallery()
	handle_comment();
	handle_like();
	//exhibit_hover()

	const user = await getting_user(the_chosen_gal)
	gal_info.text( 'The gallery of ' + user.name +'.')
	if (categories.length == 0){
		$('#main-content').append('<h3>Apparently this user\'s gallery is empty!</h3>')
	}
	
	$('#browse_butt').show()	
	$('#browse_butt').on('click',function(){
		location.replace('/browse_galleries');
	})
}


//_MAIN___________________________________________________________
main =  async()=>{
	Mustache.tags = ["[[", "]]"];
	
	display_gallery()
}

main()
	
});	
