
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
var input_content = document.querySelector('#input_comment')
var modal_return_id = 0
var like_click_id = 0 //?
var exhibits_ids = []

//Mustache templates
prev_template = $('#preview-template').html()
exhibit_template = $('#exhibit-template').html()
modal_inner_template = $('#modal-inner-template').html()


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
	var $line = $('<div></div>').attr('class','previews_line')
	
	for(var p=0; p<elements_nr; p++){		//GALLERIES' PREVIEWS
		if(recommended_galleries[iter]){
			div_prev = await draw_preview(iter,p,r)
			$line.append(div_prev)
			//$line.html(div_prev)
		}
		iter++;
	}

	return $line
}

draw_preview = async(iter,c,r)=>{  			//c-column; r-row
	var buffer = await get_avatar(recommended_galleries[iter].gallery)
	
	html = Mustache.render(prev_template,{
		prev_id: 	'prev_' + r + c,
		img_src: 	buffer,
		prev_title: users[iter].name,
		prev_title2:users[iter].city
	})

	return html
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
					buff = URL.createObjectURL( new Blob( [data], {type:'image/png'}) );
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get avatar', e)
		})
	return buff
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
		line = await draw_line(iter,l);
		iter += elements_nr;
		$('#previews').append(line);
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
		like_nr:		'lel'
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
		const gallery_id = the_chosen_gall
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
				console.log('dostalem komentarze, to one: ',data)
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
			gallery_id: the_chosen_gall,
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
//___________________________________________________________

handle_like = ()=>{
	$('.exhibit_like').hover(function(){
		$(this).css('cursor', 'pointer');
		console.log('like')
	})

	 $('.exhibit_like').on('click', function(){
	  	document.getElementById(this.id).like_nr=3
		 temp_like=temp_like+1;
		 document.getElementById(this.id).innerHTML = document.getElementById(this.id).like_nr;
	 	//like_click_id=this.id;
	 	console.log(this.id)
	 })
}


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



display_gallery = () =>{
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
			exhibit_hover()
			const user = await getting_user(the_chosen_gall)
			gal_info.textContent = 'The gallery of '//+user.name
			$('#browse_butt').show()
		})
	})
	
	$('#browse_butt').click(function(){
		location.reload(true) 
	})
}


//=====main function
main =  async ()=>{
	Mustache.tags = ["[[", "]]"];
	
	//DEALING WITH THE RECOMMENDED LIST
	await previews()
	
	//DISPLAYING ACTUAL GALLERY
	display_gallery()
	
	//await previews()
	//draw and use modals:
	
}

main()
	
});	
