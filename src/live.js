'use strict'

const fs = require('fs')

process.EventEmitter = process.EventEmitter || require('events')
const LRWebSocketServer = require('livereload-server')

let server = null

const orgCreateConnection = LRWebSocketServer.prototype._createConnection

LRWebSocketServer.prototype._createConnection = function(socket) {
  orgCreateConnection.call(this, socket)
  socket.on('error', (err) => {
    // Handle error
  })
}

module.exports = function startLRServer(port) {
  if (server) return

  server = new LRWebSocketServer({
    id: 'com.express.acme',
    name: 'Acme',
    version: '1.0',
    protocols: {
      monitoring: 7,
      saving: 1
    },
    port
  })

  server.on('livereload.js', (req, res) => {
    const filePath = require.resolve('livereload-js')
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      res.writeHead(200, {
        'Content-Length': data.length,
        'Content-Type': 'text/javascript'
      })

      res.end(data)
    })
  })

  server.listen((err) => {
    if (err) throw err
  })
}