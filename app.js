var cors = require('cors')
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var axios = require('axios')
const mongoose = require('mongoose')
var passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const { User } = require('./models/user')
require('./routes/passport')

// path to index router
const indexRouter = require('./routes/index')


// connect to Db
mongoose.connect("mongodb+srv://aaron:1a2b3c4d5e@react-gaming.ynddk.mongodb.net/react-gaming?retryWrites=true&w=majority", {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
})

var app = express()
// app.use(cors())

app.use(cors({
  // people coming from "http://localhost:3000"
  origin: "http://localhost:3000",
  // allow client to send credentials like cookies and headers
  credentials: true
}))

// Saving session
app.use(session({
  secret: "fooooooooooooo",
  resave: true,
  saveUninitialized: false,
  // new MongoStore needs a connection, we have an existing connection so we re-use that
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // cookie: {
  //     maxAge: 3600000
  // }
}))

// Reading Cookies to read session
// secret needs to be the same as what is provided to cookieParser
app.use(cookieParser("fooooooooooooo"))

app.use(passport.initialize())
app.use(passport.session())
// End of the Middleware


// Start of routes
app.get('/failed', (req, res) => {
  res.redirect('http://localhost:3000')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function (req, res) {
    res.redirect('http://localhost:3000')
  })

app.get('/auth/discord', passport.authenticate('discord'))

app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('http://localhost:3000')
  })


app.post("/users/login", (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) throw err
    // if no user found or password doesn't match etc
    if (!user) {
      res.status(401).send({ name: "Incorrect Credentials", message: "The details you have entered are not correct" })
    } else {
      // log in the user through the request object
      req.logIn(user, err => {
        if (err) throw err
        res.send(user)
      })
    }
  })(req, res, next)
})

app.post('/users/register', (req, res) => {
  //3 args
  //1 new User object
  //2 password => that gets automatically hashed and stored in db
  //3 callback
  console.log(`Req body: ${req.body}`)
  User.register(new User({ username: req.body.username, displayName: req.body.username }), req.body.password, function (err, user) {
    // creates a new User
    // if theres an error
    if (err) {
      console.log(err)
      // return that error sent in the response object
      return res.send({ fail: err })
    } else {
      // if it works, authenticate the user, attaches session cookie to response automatically
      passport.authenticate('local')(req, res, function () {
        return res.send(user)
      })
    }
  })

})

app.get('/users/me', (req, res) => {
  // when the client refreshes the page, it makes a request to this route
  // passport reads the cookie and attaches the user to the req object
  // then we send back the user
  res.send(req.user)
})

app.get('/users/logout', (req, res) => {
  // call the logout function provided by passport
  req.logOut()
  // send an ok
  res.sendStatus(200)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine')

// app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
// app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  //res.render('error')
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log("Server started on port ", port))

module.exports = app
