const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
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


module.exports = router
