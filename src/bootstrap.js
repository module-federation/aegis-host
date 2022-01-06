'use local'

require('dotenv').config()
require('regenerator-runtime')
const importFresh = require('import-fresh')
const app = require('express')()
const server = require('./server')

function clearRoutes () {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path)
  )
}

function load (aegis = null) {
  if (aegis) {
    aegis.dispose()
    clearRoutes()
  }

  const remote = importFresh('./remoteEntry.js')

  return remote.aegis.get('./server').then(async factory => {
    const aegis = factory()
    await aegis.init(app)

    app.use('/reload', async (_req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1>')
    })
  })
}

load().then(async () => server.start(app))
