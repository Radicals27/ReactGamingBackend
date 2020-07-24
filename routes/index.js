var express = require('express')
var router = express.Router()
var axios = require('axios')

// Require Statements
const mongoose = require('mongoose')

// for cross site communication
const cors = require('cors')

const passport = require("passport")
// uses the cookies to read session data 
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser')
const {User} = require('../models/user')

require('./passport')

/* GET home page. */
router.get('/', function (req, res, next) {
  axios.get(`https://api.rawg.io/api/games`)
    .then(gameResults => {
      console.log(gameResults.data.results)
      res.send(gameResults.data.results)
    })
    .catch(err => {
      console.log(err)
    })

})

module.exports = router
