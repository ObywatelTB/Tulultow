//settings, avatar handling etc.
$(document).ready(function(){

handle_avatar = ()=>{
	$('#avatar').click(function(){
		console.log('he')
		
	})
}

//MODAL - adding avatar pic
create_modal = async()=>{
	var span = $(".close")
	
	$('#avatar').click( function(){
		$("#myModal").css("display", "block");	
		//$('#modal_p').text( 'Lets add a new avatar.' )
	})

	span.click( function() {					//closing
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
	$('#modal_button').click(function(){ //button in Modal
		console.log('klik in modal')
		
		/* fetch('/users/me/avatar',{method: 'POST', headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					title,
					content,
					category: new_exhibit_category 
				})
			}).then((response)=>{
				response.json().then((data)=>{
					if(data.error){
						$('#modal_p').text(data.error)
					}else{
						$('#modal_p').text('New photo added!')
						//location.reload(true) 
					}
				})
			}).catch((e)=>{
				console.log('wewnatrz funkcji button modal, new avatar',e)
			}) */
		
	})
}

main = ()=>{
	handle_avatar()
	create_modal()
	handle_modal_button()
	
}

main()

});