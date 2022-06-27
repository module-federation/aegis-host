'use strict'

require('regenerator-runtime')
const express = require('express')
const server = require('./server')
const app = express()

function clearRoutes () {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path)
  )
}

async function load (aegis = null) {
  if (aegis) {
    aegis.dispose()
    clearRoutes()
  }

  import('host/container').then(async aegis => {
    const models = await import('apps/models')
    const handle = await aegis.init(models)

    app.use(express.json())
    app.use(express.static('public'))

    app.use('/reload', async (req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1>')
    })

    app.all('*', (req, res) => handle(req.path, req.method, req, res))
  })
}

load().then(() => server.start(app))
