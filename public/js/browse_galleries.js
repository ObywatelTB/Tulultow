//drawing the user's gallery



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
prev_template = $('#preview-template').html()


$(function(){

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
	gal_info.text('These galleries might interest you:')
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

choose_gallery = ()=>{
	$('.preview').on('mousemove',function (){  	//mouse enters
		$(this).css('cursor', 'pointer');

		$(this).unbind().click(async function(){
			const prev_id = this.id
			const row = parseInt(prev_id.slice(-2,-1))
			const col = parseInt(prev_id.slice(-1))
			const index = row*elements_nr + col
			the_chosen_gal = String(recommended_galleries[index].gallery)

			open_specific_gallery(the_chosen_gal)
			//$('#previews').hide()
		})
	})
}

open_specific_gallery = async(the_chosen_gal)=>{
	location.replace('/browse_galleries/'+ the_chosen_gal);
}


display_gallery = async() =>{
	await draw_gallery()
	exhibit_hover()
	const user = await getting_user(the_chosen_gal)
	gal_info.text( 'The gallery of ' + user.name )
	$('#browse_butt').show()
	
	$('#browse_butt').on('click',function(){
		location.reload(true) 
	})
}


//=====main function
main =  async ()=>{
	Mustache.tags = ["[[", "]]"];
	
	//DEALING WITH THE RECOMMENDED LIST
	await previews()
	choose_gallery() //sets the "the_chosen_gal" variable
}

main()
	
});	
