//Requires acting like imports or includes
const express = require('express')//routing
const mongoose = require('mongoose')//database
//const bodyParser = require('body-parser')//parse request body
const passport = require('passport')//authentication

//application specific routing
const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')


//Creates an Express application. The express() function is a top-level function
//exported by the express module.
const app = express()

//app.use([path,] callback [, callback...])
//Allow accessing data from defined sources as javascript object
//Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
//For example, this middleware function will be executed for every request to the app:

//Express now (v4.16.0 onwards) has body-parser by default
//app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
//bodyParser: Parse incoming request bodies in a middleware before your handlers,
//available under the req.body property.

/******************************************************************************/
//DB CONFIG
//mongoURI exported, see config/keys.js file
//db is just a string
const db = require('./config/keys').mongoURI

//Connect to mongodb
//connect is a Promise = asynchronous attempt of something
//                     = received requisition, trying to resolve while doing other stuff
//                     = > Remember Node.js works on a event loop within single thread
// received a warning passing just connect(db):
// DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version.
// To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
console.log(`Check mongoose connection: ${ mongoose.connection.readyState }`)
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log(`MongoDB Connected; Connection status: ${mongoose.connection.readyState}`))
  .catch(err => console.log(`MongoDB Connection failed! ${err}`))

// this will appear on console before MongoDB Connected message, because connect
// is a promise -> asynchronous -> wait response to call then statement
console.log('After? Before?')
/******************************************************************************/
const home = require('./routes/api/home')
app.use('/', home)
// app.get(path, um_ou_mais_callbacks_separados_por_virgula)
// app.get(path, callback [, callback ...])
// Routes HTTP GET requests to the specified path with the specified callback functions.


//Passportmiddleware
app.use(passport.initialize())

// Passport CONFIG
// This require shows that the returning value is yet another function,
// which receives passport as argument. Just as getAttr().InternalAttr(),
// we can have the returning function being called.
require('./config/passport')(passport)

// Use Routes
// app.use([path,] callback [, callback...])
// Mounts the specified middleware function or functions at the specified path:
// the middleware function is executed when the base of the requested path matches path.
const apiRoutes = {
  routes: '/routes',
  users: '/api/users',
  profile: '/api/profile',
  posts: '/api/posts'
}
app.get('/routes', (req, res) => res.json(apiRoutes))
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

app.use((req, res) => res.json({noroute:`invalid route ${Date.now()}`}) )

// The process object is a global that provides information about, and control over, the current Node.js process.
// As a global, it is always available to Node.js applications without using require().
const port = process.env.PORT || 5000
// app.listen([port[, host[, backlog]]][, callback])
// Binds and listens for connections on the specified host and port.
// This method is identical to Node’s http.Server.listen().
app.listen(port, () => console.log(`Server running on port ${port}`), () => console.log('Mais um callback na lista'))

// References
// http://www.luiztools.com.br/post/o-que-e-nodejs-e-outras-5-duvidas-fundamentais/?gclid=EAIaIQobChMI78Gb-qHh3QIVjoORCh0AagB8EAAYASAAEgKdz_D_BwE
// http://expressjs.com/en/api.html#app.get.method
// https://nodejs.org/api/process.html#process_process_env
// http://expressjs.com/en/api.html#app.listen
