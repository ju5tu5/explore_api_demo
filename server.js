require('dotenv').config() // gets LASTFM_API_KEY

const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')
const fetch = require('node-fetch')
const io = require('socket.io')(http)
const port = process.env.PORT || 4242

function cleanLastfmRecentTracks (data) {
  return data.recenttracks.track.map(item => {
    return {
      artist: item.artist['#text'],
      song: item.name,
      date: item.date.uts
    }
  })
}

function filterLastfmRecentTracks (data) {
  return data.recenttracks.track.filter(item => {
    return item.artist['#text'] === 'The Flashbulb'
  })
}

function reduceLastfmRecentTracks (data) {
  return data.recenttracks.track.reduce((accumulator, item) => {
    return accumulator +  item.artist['#text'] + ', '
  },'')
}

// Get the data from lastFM
fetch('http://ws.audioscrobbler.com/2.0/?' + new URLSearchParams({
  api_key: process.env.LASTFM_API_KEY,
  format: 'json',
  limit: 200,
  method: 'user.getRecentTracks',
  user: 'ju5tu5nl'
}))
  .then(response => response.json())
  .then(data => console.table(reduceLastfmRecentTracks(data)))
  .catch(errObj => console.error(errObj))


// Server static files
app.use(express.static(path.resolve('public')))

// Deal with socket.io connections
io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

// Start listening
http.listen(port, () => {
  console.log('Listening on port ', port)
})

