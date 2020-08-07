
const gal_info = document.querySelector("#gal_info")
const room1header = document.querySelector("#room1")
//const room2header = document.querySelector("#room2")
//const e1r1 = document.querySele

gal_info.textContent = '...'

var rooms_count = 0

draw_table = ()=>{
	for(var r=0;r<rooms_count;r++){	   					//rooms
		fetch('/exhibits/'+r,{method: 'GET'}).then((response)=>{
			response.json().then((data)=>{
				if(data.error){
					gal_info.textContent = data.error
				}else{
					var room = document.createElement('div')
					room.setAttribute('class','room');
					 //console.log(data)
					var e1 = document.createElement('h2');
					var t1 = document.createTextNode(data[0].category)
					e1.appendChild(t1) 
					room.appendChild(e1);
					for(var e=0; e<data.length; e++){					//exhibits
						var p1 = document.createElement('p');
						p1.appendChild(document.createTextNode(data[e].title))
						
						var p2 = document.createElement('p');
						p2.appendChild(document.createTextNode(data[e].content))
						
						var div1 = document.createElement('div');
						div1.setAttribute('class','exhibit');
						div1.appendChild(p1);
						div1.appendChild(p2);
						
						room.appendChild(div1);
					}
					document.getElementById('rooms').appendChild(room);
				}
			})
		}).catch((e)=>{
			console.log('blad wewnatrz funkcji login',e)
		})
	}
}

first_fetch =  async ()=>{
	await fetch('/galleries/me',{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				rooms_count = data[0].rooms.length
				//console.log('he',rooms_count)
			}
		}).catch((e)=>{
			console.log('wewnatrz funkcji login',e)
		})
	})
	
	draw_table()
	
}

first_fetch()
	

/* fetch('/galleries/me',{method: 'GET'}).then((response)=>{
	response.json().then((data)=>{
		if(data.error){
			gal_info.textContent = data.error
		}else{
			for(var r=0;r<1;r++){	   //rooms
				var room = document.createElement('div')
				room.setAttribute('class','room');
				
				var e1 = document.createElement('h2');
				var t1 = document.createTextNode(data[0].categories[r].category)
				e1.appendChild(t1) 
				room.appendChild(e1);
				for(var e=0; e<2; e++){//exhibits
					var p1 = document.createElement('p');
					p1.appendChild(document.createTextNode(data[0].rooms[0][r]))
					var exhibit_id = data[0].rooms[r].room[e].exhibit
					console.log(exhibit_id)
					//p1.appendChild(document.createTextNode('Tytul 1'))
					
					var p2 = document.createElement('p');
					//p2.appendChild(document.createTextNode(data[0].rooms[e]))
					p2.appendChild(document.createTextNode('Tytul 2'))
					
					var div1 = document.createElement('div');
					div1.setAttribute('class','exhibit');
					div1.appendChild(p1);
					div1.appendChild(p2);
					
					room.appendChild(div1);
				}
				document.getElementById('rooms').appendChild(room);
			}
		}
	})
}).catch((e)=>{
	console.log('wewnatrz funkcji login',e)
}) */