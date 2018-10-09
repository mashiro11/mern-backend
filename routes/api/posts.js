const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

const validatePostInput = require('../../validation/post')

// @route   GET api/posts/test
// @desc    Test posts route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"}))

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body)
  if(!isValid){
    res.state(400).json(errors)
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  })
  newPost.save().then(post => res.json(post))
})

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
      .sort({ date: -1 })
      .then(posts => res.json(posts))
      .catch( err => {
        res.status(404).json(err)
      })

})

// @route   GET api/posts/:id
// @desc    Get posts by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
      .then(post => res.json(post))
      .catch( err => {
        err.nopostfound = 'No post with provided ID'
        res.status(404).json(err)
      })

})

// @route   DELETE api/posts/:id
// @desc    Delete posts by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
            .then(post => {
              if(post.user.toString() !== req.user.id){
                return res.status(401).json({ notauthorized: 'User not authorized' })
              }

              post.remove().then(() => res.json({ success: 'Post deleted' }))
            })
            .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
      })
      .catch( err => res.status(404).json(err))

})

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
            .then(post => {
              if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({alreadyliked: 'User already liked this post'})
              }
              post.likes.unshift({ user: req.user.id })
              post.save().then(post => res.json(post))
            })
            .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
      })
      .catch( err => res.status(404).json(err))

})

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
            .then(post => {
              if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res.status(400).json({ notliked: 'You have not liked yet' })
              }
              const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id)
              post.likes.splice(removeIndex, 1)
              post.save().then(post => res.json(post))
            })
            .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
      })
      .catch( err => res.status(404).json(err))

})

// @route   POST api/posts/comment/:id
// @desc    Comment to post
// @access  Private
router.post('/comment/:post_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body)
  if(!isValid){
    res.state(400).json(errors)
  }

  Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          avatar: req.user.avatar,
          user: req.user.id
        }
        post.comments.unshift(newComment)
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
})

// @route   DELETE api/posts/comment/:id
// @desc    Delete a comment on a post
// @access  Private
router.delete('/comment/:post_id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Post.findById(req.params.post_id)
      .then(post => {
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
          return res.status(404).json({commentnotexists: 'Comment does not exist'})
        }
        const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)

        post.comments.splice(removeIndex, 1)
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
})

module.exports = router
