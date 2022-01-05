'use local'

require('dotenv').config()
require('regenerator-runtime')
const importFresh = require('import-fresh')
const server = require('express')()
const port = process.env.PORT || 3000
const greeting = `🔥 hot next on http://localhost:${port}`

function clearRoutes () {
  server._router.stack = server._router.stack.filter(
    k => !(k && k.route && k.route.path)
  )
}

function load (aegis = null) {
  if (aegis) {
    aegis.dispose()
    clearRoutes()
  }

  const remote = importFresh('./remoteEntry.js')
  return remote.microlib.get('./server').then(async factory => {
    const aegis = factory()
    const host = await aegis.init()
    //const handle = app.getRequestHandler()

    server.use('/reload', async (_req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1>')
    })
    server.use(host.routes)
    //server.use(host.middleware)
    //server.all('*', (req, res) => routes(req, res, parse(req.url, true)))
  })
}

load().then(() => server.listen(port, () => console.info(greeting)))
