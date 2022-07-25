'use strict'

require('dotenv').config()
require('regenerator-runtime')
const importFresh = require('import-fresh')
const express = require('express')
const server = require('./server')
const app = express()
const passport = require('passport-jwt')

function clearRoutes () {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path)
  )
}

async function load (aegis = null) {
  if (aegis) {
    await aegis.dispose()
    clearRoutes()
  }

  const remote = importFresh('../dist/remoteEntry.js')
  return remote.get('./hostContainer').then(async factory => {
    const aegis = factory()
    const remotes = (await remote.get('./remoteEntries'))()
    const handle = await aegis.init(remotes)

    app.use(express.json())
    app.use(express.static('public'))

    app.post(
      '/profile',
      passport.authenticate('jwt', { session: false }),
      function (req, res) {
        res.send(req.user.profile)
      }
    )

    var JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
    opts.secretOrKey = 'secret'
    opts.issuer = 'accounts.examplesoft.com'
    opts.audience = 'yoursite.net'
    passport.use(authenticate (req, res) { 
    })


    const router = express.Router()
    router.route(require('myroutes'))
    router.use(authStrategy)


      // Passport: flexible multiple strategis
      // routes: configurable protection
      // strategies: configurable at runtime

  

    app.use('/reload', async (req, res) => {
      await load(aegis)
      res.send('<h1>reload complete</h1><a href="/">back</a>')
    })

    app.all('*', (req, res) => handle(req.path, req.method, req, res))
  })
}

load().then(() => server.start(app))
