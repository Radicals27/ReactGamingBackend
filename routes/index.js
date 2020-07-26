var express = require('express')
var router = express.Router()
var axios = require('axios')
const request = require('request')

//Rawg requires a user-agent with the name of the app in the header
const userAgent = { 'User-Agent': 'React-gaming(GitHub)' }

const optionsTrending = {
  method: 'GET',
  headers: userAgent,
  url: 'https://api.rawg.io/api/games/lists/main',
  qs: {
    ordering: '-relevance',
    discover: true,
    page_size: 10
  }
}

const optionsTopRatedRecommended = {
  method: 'GET',
  headers: userAgent,
  url: 'https://api.rawg.io/api/games',
  qs: {
    ordering: '-added',
    page_size: 10
  }
}

let parsedResult

async function apiCall(options) {
  // (I.) promise to return the parsedResult for processing
  function rawgRequest() {
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })

    })
  }

  // (II.)
  try {
    parsedResult = await rawgRequest()
  } catch (e) {
    console.error(e)
  }
  return parsedResult
}

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(await apiCall(optionsTopRatedRecommended))
  console.log('/api/trending endpoint has been called!')
})

router.get('/trending', async (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(await apiCall(optionsTrending))
  console.log('/api/trending endpoint has been called!')
})

// /* GET home page. */
// router.get('/', function (req, res, next) {
//   axios.get(`https://api.rawg.io/api/games`)
//     .then(gameResults => {
//       console.log(gameResults.data.results)
//       res.send(gameResults.data.results)
//     })
//     .catch(err => {
//       console.log(err)
//     })

// })


module.exports = router
