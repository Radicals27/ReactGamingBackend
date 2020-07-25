var express = require('express')
var router = express.Router()
var axios = require('axios')
const request = require('request')

//Rawg requires a user-agent with the name of the app in the header
const userAgent = { 'User-Agent': 'React-gaming(GitHub)' }

/*
   variables to get specific data
*/

// trending titles
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

// top rated titles
const optionsTopRatedRecommended = {
  method: 'GET',
  headers: userAgent,
  url: 'https://api.rawg.io/api/games',
  qs: {
    ordering: '-added',
    page_size: 10
  }
}

// game details variables
const optionsVideogame = {
  method: 'GET',
  headers: userAgent,
  url: undefined
}

// search routes
const optionsVideogameAutocomplete = {
  method: 'GET',
  headers: userAgent,
  url: 'https://api.rawg.io/api/games',
  qs: {
    search: undefined
  }
}

let parsedResult

async function apiCall(options) {
  // returns the parsedResult for processing
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
  try {
    parsedResult = await rawgRequest()
  } catch (e) {
    console.error(e)
  }
  
  return parsedResult
}

/* 
  Routes
*/

// endpoint for top rated/root page
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(await apiCall(optionsTopRatedRecommended))
  console.log('root endpoint has been called!')
})
// enpoints for trending games
router.get('/trending', async (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(await apiCall(optionsTrending))
  console.log('/trending endpoint has been called!')
})


// endpoint for the details page
router.get('/game/:rawgId', async (req, res) => {
  const id = req.params.rawgId.match(/\d+/)
  const getPrimaryDetails = async () => {
    optionsVideogame.url = `https://api.rawg.io/api/games/${id}`
    return await apiCall(optionsVideogame)
  }
  // these variables hold specific data
  const getScreenshots = async () => {
    optionsVideogame.url = `https://api.rawg.io/api/games/${id}/screenshots`
    return await apiCall(optionsVideogame)
  }

  const getYoutube = async () => {
    optionsVideogame.url = `https://api.rawg.io/api/games/${id}/youtube`
    return await apiCall(optionsVideogame)
  }

  const primary = await getPrimaryDetails()
  const secondary = await Promise.all([
    getScreenshots(),
    getYoutube()
  ])
  const detailsCollected = {
    ...primary,
    screenshots: parseInt(primary.screenshots_count) > 0 ? secondary[0].results : [],
    youtube: parseInt(primary.youtube_count) > 0 ? secondary[3].results : []  
  }

  res.set('Cache-Control', 'no-cache')
  res.json(detailsCollected)
  console.log(`/api/videogame/${id} endpoint has been called!`)
})

module.exports = router
