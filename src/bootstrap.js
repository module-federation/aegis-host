'use strict'

require('dotenv').config()
require('regenerator-runtime')
const importFresh = require('import-fresh')
const serverless = /true/i.test(process.env.SERVERLESS)
const express = require('express')
const webapp = express()
const server = require('./server')
const removeRoute = require('express-remove-route')

function clearRoutes () {
  removeRoute(webapp, '/')
}

function load (aegis = null) {
  if (aegis) {
    aegis.dispose()
    clearRoutes()
  }

  const remote = importFresh('./remoteEntry.js')

  return remote.aegis.get('./server').then(async factory => {
    const aegis = factory()
    const app = await aegis.init(remote)

    webapp.use('/reload', async (_req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1>')
    })
    webapp.use(express.static('public'))
    //webapp.use(express.json())
    webapp.all('*', async (req, res) => app.handle(req, res))
    return app
  })
}

if (!serverless) {
  //load().then(() => webapp.listen(8080))
  load().then(() => server.start(webapp))
}

let app
exports.handleServerless = async function (...args) {
  if (!app) {
    app = await load()
  }
  return app.handleServerless(...args)
}
