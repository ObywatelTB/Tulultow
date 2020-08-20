//drawing the user's gallery
$(document).ready(function(){
	
//const gal_info = document.querySelector("#gal_info")
// gal_info.textContent = '...'

//var rooms_count = 0
var recommended_galleries = []	
const lines_nr = 2
const elements_nr = 5
/* var new_ex_cats = [] 			//new-exhibit categories
var new_exhibit_category = ''
var new_category = ''			//while creating new category
var exhibits_ids = [];			//used while deleting exhibits

var buttons_count = 0
var buttons_array = []
 */

//=====drawing the rooms
draw_room = (l)=>{
	//var t1 = document.createTextNode(recommended_galleries[l].gallery)
	
	var line = document.createElement('div')
	line.setAttribute('class','room');
	 
	//var e1 = document.createElement('h2');	//name of the gallery
	//e1.appendChild(t1) 
	//line.appendChild(e1);
	
	var ids_arr = []
	for(var e=0; e<3; e++){	//EXHIBITS
		var p1 = document.createElement('p');
		p1.appendChild(document.createTextNode(recommended_galleries[e].gallery))
		
		var p2 = document.createElement('p');
		p2.appendChild(document.createTextNode(recommended_galleries[e].points))
		
		var iks = document.createElement('span');
		iks.setAttribute('class','delete');
		iks.setAttribute('id','delete_'+l+e) //eg: delete_21
		iks.appendChild(document.createTextNode('×'))
		
		var div1 = document.createElement('div');
		div1.setAttribute('class','exhibit');
		div1.setAttribute('id','exhibit_'+l+e)
		div1.appendChild(iks);
		div1.appendChild(p1);
		div1.appendChild(p2);
		
		line.appendChild(div1);
	}

	return line
}

draw_gallery = async()=>{
	for(var l=0; l<lines_nr; l++){	 //LINES
		const room = await draw_room(l);
		document.getElementById('rooms').appendChild(room);
	}
	//$('.room').css('margin-bottom','60px')
}


//=====main function
main =  async ()=>{
	//getting the nr of recommended galleries:
	await fetch('/users/me',{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				//categories = data[0].categories
				console.log('rg',data.recommended_galleries)
				recommended_galleries = data.recommended_galleries
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
	
	//drawing the gallery:
	await draw_gallery()

}

main()
	
});	
