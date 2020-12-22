const express = require('express')
const Gallery = require('../models/gallery')
const Exhibit = require('../models/exhibit')
const Reaction = require('../models/reaction')
const router = express.Router()
const auth = require('../middleware/auth')


// LIKES_____________________________________________________________

//switches like reaction (like/dislike)  - executed when clicking the like button
router.post('/reactions/switch_like', auth, async(req,res)=>{
	exhibit = await Exhibit.findById(req.body.exhibit_id)
	reactions = await Reaction.findOne({gallery_id: req.body.gallery_id})
	excerpt = {} 		//the like reaction for our user
	like_state = true	//(user gives a like by default)
	if(!reactions){ //its the first like/comment in the gallery
		reactions = await new Reaction({ gallery_id: req.body.gallery_id})
		console.log('Created a reactions record (with a like) for a new gallery!')
	}

	arr = reactions.likes
	if (arr.lenght != 0){	//there are already some likes in the gallery
		//looking for the previous like reaction of this specific user and exhibit
		filterBy = await {exhibit_id: req.body.exhibit_id,
			author_id:  req.user._id }
		excerpts = arr.filter(function(record){
			return Object.keys(filterBy).every(function(k){
				return String(record[k]) == String(filterBy[k])
			})
		})
		if(excerpts.length > 1){
			throw 'ERROR in the liking mechanism. Too many likes per user.'
		}

		excerpt = excerpts[0]
		if(excerpt){	//if this user already liked this exhibit
			like_state = false
		}
	}

	if(like_state){	//somebody gave a like
		const reaction_data = {
			exhibit_id: req.body.exhibit_id,
			author_id: req.user._id,
			author_name: req.user.name
		}
		reactions.likes.push( reaction_data )
		exhibit.likes = exhibit.likes + 1
		await exhibit.save()
	}else{ 			//somebody disliked
		ind = reactions.likes.findIndex(l=>{
			return l._id == excerpt._id
		})
		reactions.likes.splice(ind,1)	//deletion of a record

		exhibit.likes = exhibit.likes - 1
		await exhibit.save()
	}
	
	await reactions.save()
	try{
		res.send({likes: exhibit.likes})
	}catch(e){
		res.status(500).send(e)
	}
}) 

//gives all the ids of exhibits liked by current user
router.get('/reactions/likes/:gal', auth, async(req,res)=>{
	reactions = await Reaction.findOne({gallery_id: req.params.gal})

	try{
		my_likes = reactions.likes.filter(l=>{
			return String(l.author_id) == String(req.user._id)
		}).map(l=>{
			return l.exhibit_id
		})

		res.send(my_likes)
	}catch(e){
		res.status(500).send(e)
	}
})


//gives all the (users who gave) likes to a given exhibit in a given gallery
router.get('/reactions/likes/:gal/:ex', auth, async(req,res)=>{
	reactions = await Reaction.findOne({gallery_id: req.params.gal})
	chosen_likes = {}
	if(reactions){ //there were no reactions yet
		all_likes = reactions.likes
		chosen_likes = all_likes.filter(l=>{
			return l.exhibit_id == req.params.ex
		})
		chosen_likes_authors = chosen_likes.map(l=>{
			return l.author_name
		})
	}

	try{
		res.send(chosen_likes_authors)
	}catch(e){
		res.status(500).send(e)
	}
})



// COMMENTS______________________________________________________

//gives all the comments from a given exhibit in a given gallery
router.get('/reactions/comments/:gal/:ex', auth, async(req,res)=>{
	reactions = await Reaction.findOne({gallery_id: req.params.gal})
	chosen_comments = {}
	if(reactions){ //there were no reactions yet
		all_comments = reactions.comments
		chosen_comments = all_comments.filter(c=>{
			return c.exhibit_id == req.params.ex
		})
	}
	// var xxx = chosen_comments[0]._id.getTimestamp()
	// console.log('timeik: ', xxx)
	try{
		res.send(chosen_comments)
	}catch(e){
		res.status(500).send(e)
	}
})

//executed when submitting a comment
router.post('/reactions/comment', auth, async(req,res)=>{
	reactions = await Reaction.findOne({gallery_id: req.body.gallery_id})
	if(!reactions){ //its the first like/comment in the gallery
		reactions = await new Reaction({ gallery_id: req.body.gallery_id})
		console.log('Created a reactions record (with a like) for a new gallery!')
	}

	const reaction_data = {
		exhibit_id: req.body.exhibit_id,
		comment_content: req.body.comment_content,
		author_id: req.user._id,
		author_name: req.user.name
	}
	reactions.comments.push( reaction_data )

	//console.log(exhibit)
	await reactions.save()
	try{
		res.send(reactions)
	}catch(e){
		res.status(500).send(e)
	}
}) 

//executed when deleting a comment
router.delete('/reactions/comment/:gal/:com', auth, async(req,res)=>{
	try{
		reactions = await Reaction.findOne({gallery_id: req.params.gal})
		if(!reactions)
			return res.status(404).send()

		com_index = reactions.comments.findIndex(c=>{
			return c._id == req.params.com
		})
		console.log('ind',reactions.comments[com_index])
		removed = reactions.comments.splice(com_index,1)	//deletion of a record
		await reactions.save()
		
		res.send(removed)
	}catch(e){
		res.status(505).send(e)
	}
}) 



module.exports = router

