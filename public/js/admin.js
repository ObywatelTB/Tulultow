$(document).ready(function(){
	
const default_db_name = 'tulultow-api'
const test_db_name = 'tulultow-api-test'
// const default_db_name = 'tulultow-api-test'
// const test_db_name = 'tulultow-api'

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

get_db_name = async()=>{
	db_name = ''
	await fetch('/users/db_name',{method: 'GET'}).then( async(response)=>{
		await response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				db_name = data.name
			}
		})
	}).catch((e)=>{
		console.log('blad wewnatrz funkcji get db_name', e)
	})
	return db_name
}

visibility = (user, db_name)=>{
	if(user.administrator){
		$("#non-admin-content").hide()
		$("#admin-page").show()
	}
	$('#db_name').text(db_name).css('color','orange')
	
	if(db_name === default_db_name){ 		//Normalna DB
		$('#db_access').text('can\'t').css('color','red')
		$('#db_modify').replaceWith($('<p>Can\'t modify the main database!</p>').css('color','red') )
	}else if(db_name === test_db_name){ 	//Testowa DB
		$('#db_access').text('can').css('color','green')
	}else{
		$('#db').text('No connected to the valid database!').css('color','red')
		$('#db > p').hide()
	}
}

handle_buttons = ()=>{
	$('#clear_butt').on('click',()=>{
		clear_db()
	})
	
	$('#fill_butt').on('click',()=>{
		fill_db()
	})
}

clear_db = ()=>{
	fetch('/users/clear_db',{method: 'GET'}).then( (response)=>{
		response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				console.log(data)
			}
		})
	}).catch((e)=>{
		console.log('blad wewnatrz funkcji get db_name', e)
	})
}

fill_db = ()=>{
	fetch('/users/fill_db',{method: 'GET'}).then( (response)=>{
		response.json().then((data)=>{
			if(data.error){
				console.log(data.error)
			}else{
				console.log(data)
			}
		})
	}).catch((e)=>{
		console.log('blad wewnatrz funkcji get db_name', e)
	})
}
	
main = async()=>{
	const me = await get_myself()
	const db_name = await get_db_name()
	
	visibility(me,db_name)
	handle_buttons()
}

main()
	
})