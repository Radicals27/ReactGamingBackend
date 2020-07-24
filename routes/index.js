var express = require('express')
var router = express.Router()
var axios = require('axios')

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
