'use local'

require('regenerator-runtime')
const importFresh = require('import-fresh')
const express = require('express')
const server = require('./server')
const app = express()
const isServerless = /true/i.test(process.env.SERVERLESS)

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

  const remote = importFresh('../dist/remoteEntry.js')
  return remote.get('./hostContainer').then(async factory => {
    const aegis = factory()
    const remotes = (await remote.get('./remoteEntries'))()
    const handle = await aegis.init(remotes)

    app.use(express.json())
    app.use(express.static('public'))

    app.use('/reload', async (req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1>')
    })

    app.all('*', (req, res) => handle(req.path, req.method, req, res))
    return handle
  })
}

load().then(handle => (isServerless ? handle : server.start(app)))
