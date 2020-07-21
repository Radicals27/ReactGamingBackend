var express = require('express')
var router = express.Router()
var axios = require('axios')

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  axios.get(`https://api.rawg.io/api/games`)
    .then(res => {
      console.log(res.data.results)
      res.send(res.data.results)
    })

})

module.exports = router
