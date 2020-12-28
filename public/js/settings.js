//settings, avatar handling etc.
$(document).ready(function(){

handle_avatar = async ()=>{
	const user = await get_myself()
	const buffer = await get_avatar(user)
		
	$('#avatar').attr("src",buffer)
}

//MODAL - adding avatar pic
create_modal = async()=>{
	var span = $(".close")
	
	//HANDLING THE FILE DROP:
	$('#drop_zone').on('dragover', function(event){
		$(this).css('border','2px solid orange')
		event.preventDefault(); //drop wont work without it
	})
	$('#drop_zone').on('dragleave', function(event){
		$(this).css('border','2px solid')
		event.preventDefault(); //drop wont work without it
	})
	$('#drop_zone').on('drop', function(event){
		$(this).css('border','2px solid')
		dropHandler(event)
		location.reload(true)
	})
	
	
	$('#avatar').click( function(){
		$("#myModal").css("display", "block");	
		//$('#modal_p').text( 'Lets add a new avatar.' )
	})

	span.click( function() {					//closing
		$("#myModal").css("display", "none");
	})
	
	//not good because two conventions, jQuery and the one below. But it works!
	var myM = document.querySelector('#myModal')
	window.onclick = function(event) {
		if (event.target == myM) {
			myM.style.display = "none" ;
		}
	}
}

/* handle_modal_button = async()=>{
	$('#modal_button').click(await function(){ //button in Modal
		console.log('klik in modal')
		
	})
} */


//Handling file dropping in the MODAL
dropHandler = (event) => {
	//console.log('File(s) dropped');

	// Prevent default behavior (Prevent file from being opened)
	event.preventDefault();

	ev = event.originalEvent
	if (ev.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
			// If dropped items aren't files, reject them
			if (ev.dataTransfer.items[i].kind === 'file') {
				var file = ev.dataTransfer.items[i].getAsFile();
				//console.log('a... file[' + i + '].name = ' + file.name);
				upload_avatar(file)
			}
		}
	} else {
	// Use DataTransfer interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
			the_file = ev.dataTransfer.files[i]
			//console.log('b... file[' + i + '].name = ' + the_file.name);
			console.log(the_file)
			//upload_avatar
		}
	}
   
}

upload_avatar = async(file)=>{
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
}



get_myself = async()=>{
	user = {}
	await fetch('/users/me',{method: 'GET'}).then( async(response)=>{
			await response.json().then((data)=>{
				if(data.error){
					console.log(data.error)
				}else{
					user = data
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji get avatar', e)
		})
		
	return user
}

get_avatar = async(user)=>{
	buff={}
	const url = '/users/'+user._id+'/avatar'

	await fetch(url,{method: 'GET'}).then( async(response)=>{
			await response.arrayBuffer().then((data)=>{
				if(data.error){
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

main = async()=>{
	handle_avatar()
	create_modal()
	//handle_modal_button()	
}

main()

});