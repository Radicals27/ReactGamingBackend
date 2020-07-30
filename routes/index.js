var express = require('express')
var router = express.Router()
var axios = require('axios')
const request = require('request')

//CHICKEN

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
    page_size: 20
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


const optionsSearchArchive = {
  method: 'GET',
  headers: userAgent,
  url: 'https://archive.org/advancedsearch.php',
  qs: {
    q: undefined,
    rows: '5',
    page: '1',
    output: 'json',
    'fl[]': 'identifier',
    'sort[]': 'downloads desc'
  }
}

const optionsSearchOldgameshelf = {
  method: 'GET',
  headers: userAgent,
  url: 'https://oldgameshelf.com/api/v1/games',
  qs: {
    _q: undefined,
    _limit: '1'
  }
}

const optionsSearchSnesnow = {
  method: 'GET',
  headers: userAgent,
  url: 'https://snesnow.com/media',
  qs: {
    _q: undefined,
    _limit: '1'
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
})
// enpoints for trending games
router.get('/trending', async (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.json(await apiCall(optionsTrending))
})

    router.get('/searchArchive', async (req, res) => {
      try {
        const queryTitle = req.query.title
        const queryYear = req.query.year
        optionsSearchArchive.qs.q = `title:(${queryTitle}) AND collection:(softwarelibrary^10) AND year:(${queryYear}) AND mediatype:(software)`
        res.set('Cache-Control', 'no-cache')
        res.json(await apiCall(optionsSearchArchive))
      } catch (e) {
        console.error(e)
      }
    })

    router.get('/searchOldgameshelf', async (req, res) => {
      try {
        const queryTitle = req.query.title
        optionsSearchOldgameshelf.qs._q = queryTitle
        res.set('Cache-Control', 'no-cache')
        res.json(await apiCall(optionsSearchOldgameshelf))
      } catch (e) {
        console.error(e)
      }
    })

    router.get('/searchSnesnow', async (req, res) => {
      try {
        const queryTitle = req.query.title
        optionsSearchSnesnow.qs._q = queryTitle
        res.set('Cache-Control', 'no-cache')
        res.json(await apiCall(optionsSearchSnesnow))
      } catch (e) {
        console.error(e)
      }
    })


    router.get('/videogameAutocomplete', async (req, res) => {
      const query = req.query.q
      optionsVideogameAutocomplete.qs.search = query
      res.set('Cache-Control', 'no-cache')
      res.json(await apiCall(optionsVideogameAutocomplete))
    })


// endpoint for the details page
router.get('/games/:rawgId', async (req, res) => {
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
})

module.exports = router
