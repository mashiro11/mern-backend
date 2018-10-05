const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')

// Get db user table
const User = mongoose.model('users')
const keys = require('./keys')

// Creating options for JwtStrategy
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = keys.secretOrKey

module.exports = passport => {
  // The JWT authentication strategy is constructed as follows:
  // new JwtStrategy(options, verify)
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
        .then(user => {
          if(user){
            return done(null, user)
          }
          return done(null, false)
        })
        .catch( err => console.log(err))
    //id: user.id, name: user.name, avatar: user.avatar
  }))
}

//reference
// https://www.npmjs.com/package/passport-jwt
