var cors = require('cors')
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var indexRouter = require('./routes/index')
const mongoose = require('mongoose')
var passport = require('passport')
require('./routes/passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const { User } = require('./models/user')

// connect to Mongo Db
mongoose.connect("mongodb+srv://aaron:1a2b3c4d5e@react-gaming.ynddk.mongodb.net/react-gaming?retryWrites=true&w=majority", {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
})

var app = express()

app.use(cors({
  // people coming from front end server
  origin: "http://localhost:3000",
  // permit cookies and header credentials
  credentials: true
}))

// Save cookie of session
app.use(session({
  secret: "react-gamer",
  resave: true,
  saveUninitialized: false,
  // Re-use existing connection for Mongo store
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}))

// Read the cookies for the session
app.use(cookieParser("react-gamer"))

// Middleware setup
app.use(passport.initialize())
app.use(passport.session())


// Routes
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

// If page refreshes, get current user
app.get('/users/me', (req, res) => {
  res.send(req.user)
})

app.get('/users/logout', (req, res) => {
  // call the logout function provided by passport
  req.logOut()
  res.sendStatus(200)
})

// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine')

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
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log("Server started on port ", port))

module.exports = app
