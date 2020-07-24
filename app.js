var cors = require('cors')
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
// var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var axios = require('axios')

// Require Statements
const mongoose = require('mongoose')

const passport = require("./routes/passport")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser')
const {User} = require('./models/user')

// connect to Db
mongoose.connect("mongodb+srv://aaron:1a2b3c4d5e@cluster0.tlhpy.mongodb.net/database1?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})

var app = express()
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.get('/ping', (req, res) => {
  res.send('pong')
})


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
  res.render('error')
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log("Server started on port ", port))

module.exports = app
