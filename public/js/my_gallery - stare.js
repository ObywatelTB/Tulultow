
const gal_info = document.querySelector("#gal_info")
const room1header = document.querySelector("#room1")
//const room2header = document.querySelector("#room2")
//const e1r1 = document.querySele

gal_info.textContent = 'hejo'


fetch('/exhibits/:room',{method: 'GET'}).then((response)=>{
	response.json().then((data)=>{
		if(data.error){
			gal_info.textContent = data.error
		}else{
			for(var r=0;r<1;r++){	   					//rooms
				var room = document.createElement('div')
				room.setAttribute('class','room');
				
				var e1 = document.createElement('h2');
				var t1 = document.createTextNode(data[0].categories[r].category)
				e1.appendChild(t1) 
				room.appendChild(e1);
				for(var e=0; e<2; e++){					//exhibits
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
})


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