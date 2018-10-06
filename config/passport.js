const JwtStrategy = require('passport-jwt').Strategy

// object containing extraction methods
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')

// Get db user table
// mongoose buffers model function calls internally.
// This buffering is convenient, but also a common source of confusion.
// Mongoose will not throw any errors by default if you use a model without connecting.
const User = mongoose.model('users')
const keys = require('./keys')

// Creating options for JwtStrategy
// opts is an object literal containing options to control
// how the token is extracted from the request or verified.
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()

// secretOrKey is a string or buffer containing the secret (symmetric) or
// PEM-encoded public key (asymmetric) for verifying the token's signature.
// REQUIRED unless secretOrKeyProvider is provided.
opts.secretOrKey = keys.secretOrKey

module.exports = passport => {
  // The JWT authentication strategy is constructed as follows:
  // new JwtStrategy(options, verify)
  // verify is a function with the parameters verify(jwt_payload, done)
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // within the token, there is a payload
    // within the payload, we passed an ID, which is being accessed now
    // we search in users collection from database an user with that ID
    // findById is a promise done by a mongoose model, which means that
    // if a connection is not ready, mongoose.model is buffered and findById is waiting
    User.findById(jwt_payload.id)
        .then(user => {
          if(user){
            // done and then are similar. done returns the original promise,
            // then may return a new promise
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
// http://sandeep45.github.io/promises/2015/07/16/promises-then-vs-done-in-deferred-object.html
// https://mongoosejs.com/docs/connections.html
