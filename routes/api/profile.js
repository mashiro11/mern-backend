const express = require('express')
const router = express.Router()
const mongoose = require ('mongoose')
const passport = require('passport')

const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')
// Load profile models
const Profile = require('../../models/Profile')
// Load profile models
const User = require('../../models/User')

// @route   GET api/profile/test
// @desc    Test profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"}))

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {}
  Profile.findOne({ user: req.user.id })
         .populate('user', ['name', 'avatar'])
         .then(profile => {
           if(!profile){
             errors.noprofile = 'There is no profile for this user'
             return res.status(404).json(errors)
           }
           res.json(profile)
         })
         .catch(err => res.status(404).json(err))
})

// @route   GET api/profile/all
// @desc    Get profile by handle
// @access  Public
router.get('/all', (req, res) => {
  const errors = {}

  Profile.find()
         .populate('user', ['name', 'avatar'])
         .then(profiles => {
           if(!profiles){
             errors.noprofile = 'There are no profiles'
             res.status(404).json(errors)
           }
           res.json(profiles)
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})

// @route   GET api/profile/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {}

  Profile.findOne({ handle: req.params.handle })
         .populate('user', ['name', 'avatar'])
         .then(profile => {
           if(!profile){
             errors.noprofile = 'There is no profile for this user'
             res.status(400).json(errors)
           }
           res.json(profile)
         })
         .catch(err => {
           res.status(404).json(err)
         })
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const errors = {}

  Profile.findOne({ user: req.params.user_id })
         .populate('user', ['name', 'avatar'])
         .then(profile => {
           if(!profile){
             errors.noprofile = 'There is no profile for this user'
             res.status(400).json(errors)
           }

           res.json(profile)
         })
         .catch(err => res.status(404).json(err))
})

// @route   POST api/profile
// @desc    Create or Edit user profile
// @access  Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body)

  if(!isValid){
    return res.status(400).json(errors)
  }

  // Get fiels
  const profileFields = {}
  profileFields.user = req.user.id
  if(req.body.handle) profileFields.handle = req.body.handle
  if(req.body.status) profileFields.status = req.body.status
  if(req.body.company) profileFields.company = req.body.company
  if(req.body.website) profileFields.website = req.body.website
  if(req.body.location) profileFields.location = req.body.location
  if(req.body.bio) profileFields.bio = req.body.bio
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername
  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(',')
  }
  profileFields.social = {}
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram

  Profile.findOne({user: req.user.id })
         .then(profile => {
           if(profile){
             //Update
             Profile.findOneAndUpdate(
               {user: req.user.id},
               {$set: profileFields},
               {new: true})
               .then(profile => res.json(profile))
           }else{
             //Create
             Profile.findOne({handle: profileFields.handle}).then(profile => {
               if(profile){
                 errors.handle = 'That handle already exists'
                 res.status(400).json(errors)
               }

               //Save Profile
               new Profile(profileFields).save().then(profile => res.json(profile))
             })
           }
         })
})

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body)
  if(!isValid){
    return res.status(400).json(errors)
  }

  Profile.findOne({ user: req.user.id })
         .then(profile => {
           if(!profile){
             errors.noprofile = 'There are no profiles'
             res.status(404).json(errors)
           }
           const newExp = {
             title: req.body.title,
             company:req.body.company,
             location: req.body.location,
             from: req.body.from,
             to: req.body.to,
             current: req.body.current,
             description: req.body.description
           }

           //Add to exp array
           //put in beginning, not pushing back
           profile.experience.unshift(newExp)
           profile.save().then(profile => res.json(profile))
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})

// @route   DELETE api/profile/experience
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  Profile.findOne({ user: req.user.id })
         .then(profile => {
           const removeIndex = profile.experience
           .map(item => item.id)
           .indexOf(req.params.exp_id)
           //from removeIndex, remove 1 item. Could add others from that position
           profile.experience.splice(removeIndex, 1)
           profile.save().then(profile => res.json(profile))
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})


// @route   POST api/profile/education
// @desc    Add experience to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body)
  if(!isValid){
    return res.status(400).json(errors)
  }

  Profile.findOne({ user: req.user.id })
         .then(profile => {
           if(!profile){
             errors.noprofile = 'There are no profiles'
             res.status(404).json(errors)
           }
           const newEdu = {
             school: req.body.school,
             degree:req.body.degree,
             fieldofstudy: req.body.fieldofstudy,
             from: req.body.from,
             to: req.body.to,
             current: req.body.current,
             description: req.body.description
           }

           //Add to exp array
           //put in beginning, not pushing back
           profile.education.unshift(newEdu)
           profile.save().then(profile => res.json(profile))
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})

// @route   DELETE api/profile/education
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  Profile.findOne({ user: req.user.id })
         .then(profile => {
           const removeIndex = profile.education
           .map(item => item.id)
           .indexOf(req.params.edu_id)
           //from removeIndex, remove 1 item. Could add others from that position
           profile.education.splice(removeIndex, 1)
           profile.save().then(profile => res.json(profile))
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  Profile.findOneAndRemove({ user: req.user.id })
         .then(() => {
           User.findOneAndRemove({ _id: req.user.id })
           .then(() => res.json({success: true}))
           .catch( err => res.status(400).json(err))
         })
         .catch(err => {
           err.mymessage = 'Catch'
           res.status(404).json(err)
         })
})


module.exports = router
