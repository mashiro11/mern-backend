const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const keys = require('../../config/keys')
const gravatar = require('gravatar')

const User = require('../../models/user.js')
// @route   GET api/users/test
// @desc    Test users route
// access   Public
// req: request; res: response
// when the route api/users/test receive a GET request,
// it will call the given callback function
router.get('/test', (req, res) => res.json({msg: "Users Works"}))

// @route   GET api/users/request
// @desc    Register new User
// access   Public
router.post('/register', (req, res) => {
  //mongoose function retrieves register with given information
  User.findOne({ email: req.body.email })
      .then(user => { //promise called when findOne returns
        if(user){ //if there is a user, cannot register another
          return res.status(400).json({email: 'Email already exists'})
        } else {
          // Gets email avatar if there is one
          const avatar = gravatar.url(req.body.email, {
            s: '200', //Size
            r: 'pg', //Rating
            d: 'mm' //Default image if no avatar is found
          })
          // Generate new user object
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password
          })

          // Uses bcrypt to generate hash from given password
          bcrypt.genSalt(10, (err, salt) =>{
              bcrypt.hash(newUser.password, salt, (err, hash) =>{
                if(err) throw err
                // overwrite given password with new hash
                newUser.password = hash
                newUser.save() //save to database
                       .then(user => res.json(user)) //give user object as response
                       .catch(err => console.log(err))
              })
          })
        }
      })
})

// @route   POST api/users/request
// @desc    Login user
// access   Public
router.post('/login', (req, res) => {
  //Email and password received
  const email = req.body.email
  const password = req.body.password

  //Find within user collection register with given email
  User.findOne({ email })
      .then(user => { //when findOne returns
        if(!user){ //if no user was found with given email
          return res.status(404).json({email: 'Incorrect user or password'})
        }
        //check if password matches
        bcrypt.compare(password, user.password)
              .then(isMatch => {
                if(isMatch){
                  //User matched
                  const payload = { id: user.id, name: user.name, avatar: user.avatar}
                  jwt.sign(
                    payload, //information inside token
                    keys.secretOrKey,
                    {expiresIn: 3600},
                    (err, token) => {
                      res.json({
                        success: true,
                        token: 'Bearer ' + token
                      })
                    }
                  )
                } else {
                  return res.status(400).json({ password: 'Incorrect user or password'})
                }
              })
              .catch( err => console.log(err) )
      })
})

// @route   POST api/users/current
// @desc    Return current user
// access   Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  })
})

module.exports = router
