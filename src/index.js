const chalk = require('chalk')
const app = require('express')()
const getPort = require('get-port')
const path = require('path')
const fs = require('fs')
const http = require('http').createServer(app)
const listEndpoints = require('express-list-endpoints')

const DEFAULT_PORT = 7070

const io = require('socket.io')(http)

const readFile = (filePath) => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (error, contents) => {
    if (error) {
      console.log(
        chalk.red('Failed load the template app')
      )
      reject(error)
      process.exit(1)
    }

    resolve(contents)
  })
})

const run = async (wrappedExpressApp, { name = 'Express Endpoints App' }) => {
  const endPoints = listEndpoints(wrappedExpressApp)

  io.on('connection', function (socket) {
    console.log('a user connected')
    socket.emit('change-endpoints', endPoints)
  })

  // Will use 7070 if available, otherwise fall back to a random port
  const PORT = await getPort({ port: DEFAULT_PORT })

  // index.html with react app compiled
  const reatAppPath = path.resolve(__dirname, '../', 'app-client', 'dist', 'index.html')

  const markdownRawReactApp = await readFile(reatAppPath)

  const mkReactApp = markdownRawReactApp.replace(
    '{{{DATA WILL BE HERE}}}',
    `<script>window.__EXPRESS_ENDPOINTS_DATA__ = {
      endpoints: ${JSON.stringify(endPoints)},
      port: ${PORT},
      name: '${name}'
    }</script>
    `
  )

  app.get('/', (req, res) => {
    res.send(mkReactApp)
  })

  http.listen(PORT, () => {
    console.log(
      chalk.cyan(`⚡  Enpoints App: http://localhost:${PORT}`)
    )
  })
}

module.exports = run
