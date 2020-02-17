const chalk = require('chalk')
const listEndpoints = require('express-list-endpoints')
const express = require('express')
const getPort = require('get-port')
const livereload = require('livereload')

const DEFAULT_PORT = 7070

const run = async (wrappedExpressApp, port) => {
  const endPoints = listEndpoints(wrappedExpressApp)
  const app = express()
  const portSocket = 35728

  livereload.createServer({
    port: portSocket
  })

  // Will use 7070 if available, otherwise fall back to a random port
  const PORT = await getPort({ port: DEFAULT_PORT })
  const host = 'localhost'
  const reloadTimeout = 400

  // Build html File
  const htmlContens = `
  <!DOCTYPE html>
  <html lang='en'>
  <head>
    <meta charset='UTF-8'/>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
    <meta http-equiv='X-UA-Compatible' content='ie=edge'/>
    <title>Express Endpoints App</title>
  </head>
  <body>
    <h1>Express Endpoints App</h1>
    <div>
      ${endPoints.map(endPoint => (
        `<div>
          ${endPoint.path}
          ${endPoint.methods.map(method => (
            `<button onclick="makeRequest('http://localhost:${port}${endPoint.path}', '${method}')">
              ${method}
            </button>`
          ))}
        </div>`
      ))}
    </div>
    <script>
      const makeRequest = async (path, method) => {
        console.log(path, method)
    
        if(method === 'GET') {
          const res = await fetch(path)
          const data = await res.json()
          console.log(data)
        }
      }

      document.write('<script src="//' + (location.host || '${host}').split(':')[0] + ':${portSocket}/livereload.js?snipver=1"></' + 'script>')
      document.addEventListener('LiveReloadDisconnect', function() { setTimeout(function() { window.location.reload(); }, ${reloadTimeout}); })
    </script>
  </body>
  </html>
  `

  app.get('*', (req, res) => {
    res.send(htmlContens)
  })

  app.listen(PORT, () => {
    console.log(
      chalk.cyan(`⚡  Enpoints App: http://localhost:${PORT}`)
    )
  })
}

module.exports = run
