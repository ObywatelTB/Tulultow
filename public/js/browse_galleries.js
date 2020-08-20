//drawing the user's gallery
$(document).ready(function(){

const elements_nr = 5  //number of previews visible in one line!
var recommended_galleries = []	
var recommended_nr = 0
var users = []  //array of owners of the recommended galleries

getting_galleries = async()=>{
	//getting the recommended galleries:
	await fetch('/users/me',{method: 'GET'}).then(async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				console.log('rg',data.recommended_galleries)
				recommended_galleries = data.recommended_galleries
			}
		})
	}).catch((e)=>{
		console.log(e)
	})
	
}

getting_users = async()=>{
	iter = 0
	while(recommended_galleries[iter]){
		gallery_id = recommended_galleries[iter].gallery
		await fetch('/galleries/owner/'+gallery_id,{
		method: 'GET', headers: {
			'Content-Type': 'application/json'
			}
		}).then( async(response)=>{
			await response.json().then((data)=>{
				if(data.error){
					console.log(data.error)
				}else{
					users.push(data)
					console.log('getting users',data.name)
					//location.reload(true) 
				}
			})
		}).catch((e)=>{
			console.log('wewnatrz funkcji getting users',e)
		})
		iter++;
	}
}


//drawing the previews of recommended gals
draw_line = (iter)=>{
	var line = document.createElement('div')
	line.setAttribute('class','room');
	
	for(var p=0; p<elements_nr; p++){		//GALLERIES' PREVIEWS
		if(recommended_galleries[iter]){
			div1 = draw_preview(iter)
		}
		iter++;
		line.appendChild(div1);
	}

	return line
}

draw_preview = (iter)=>{
	var p1 = document.createElement('p');
	p1.appendChild(document.createTextNode(users[iter].name))
	
	var p2 = document.createElement('p');
	p2.appendChild(document.createTextNode(users[iter].city))
	
	/* var iks = document.createElement('span');
	iks.setAttribute('class','delete');
	iks.setAttribute('id','delete_'+l+e) //eg: delete_21
	iks.appendChild(document.createTextNode('×'))
	*/
	
	var div1 = document.createElement('div');
	div1.setAttribute('class','exhibit');
	//div1.setAttribute('id','exhibit_'+l+e)
	//div1.appendChild(iks);
	div1.appendChild(p1);
	div1.appendChild(p2);
	
	return div1
}


//=====main function
main =  async ()=>{
	await getting_galleries()
	await getting_users()
	
	recommended_nr = recommended_galleries.length
	lines_nr = Math.floor( recommended_nr / elements_nr)
	
	iter = 0
	for(l = 0; l<=lines_nr; l++){
		const line = await draw_line(iter);
		iter += elements_nr;
		document.getElementById('rooms').appendChild(line);
	}
	

}

main()
	
});	
