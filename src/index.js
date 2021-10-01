/**
 * Handle options and start the service.
 * Options:
 *
 * - run as serverless function or as web server
 * - http or https
 * - authorized routes enabled or disabled (json web token)
 * - clustering enabled or disabled
 * - hot reload as rolling restart or module cache refresh
 */

'use strict'

require('dotenv').config()
require('regenerator-runtime')
const importFresh = require('import-fresh')

const { adapters, services } = require('@module-federation/aegis')

const {
  AuthorizationService,
  CertificateService,
  ClusterService,
  MeshService
} = services

const { ServerlessAdapter } = adapters

const fs = require('fs')
const tls = require('tls')
const http = require('http')
const https = require('https')
const websocket = require('ws')
const express = require('express')
const graceful = require('express-graceful-shutdown')
const StaticFileHandler = require('serverless-aws-static-file-handler')

const port = process.argv[2] ? process.argv[2] : process.env.PORT || 80
const sslPort = process.env.SSL_PORT || 443
const apiRoot = process.env.API_ROOT || '/microlib/api'
const hotReloadPath = process.env.HOTRELOAD_PATH || '/microlib/reload'
const certLoadPath = process.env.CERTLOAD_PATH || '/microlib/load-cert'
const cloudProvider = process.env.CLOUDPROVIDER || 'aws'
const clusterEnabled = /true/i.test(process.env.CLUSTER_ENABLED)
const publicIpCheckHost = process.env.IPCHECKHOST || 'checkip.amazonaws.com'
const domain = process.env.DOMAIN || 'federated-microservices.org'
const domainEmail = process.env.DOMAIN_EMAIL
const sslEnabled = // required in production
  /PROD/i.test(process.env.NODE_ENV) || /true/i.test(process.env.SSL_ENABLED)

// enable authorization if selected
const app = AuthorizationService.protectRoutes(express(), '/microlib')

// write out our process id for stop scripts
fs.writeFileSync('PID', `${process.pid}\n`, 'utf-8')

function isServerless () {
  return (
    /true/i.test(process.env.SERVERLESS) || /serverless/i.test(process.title)
  )
}

/**
 * Callbacks attached to existing routes are stale.
 * Clear the routes whose controllers we need to update.
 */
function clearRoutes () {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path && k.route.path.startsWith(apiRoot))
  )
}

/**
 * Load federated server module. Call `clear` to delete non-webpack cache if
 * hot reloading. Call `start` to import remote models, adapters, services,
 * set API routes and load persisted data from storage.
 *
 * @param {boolean} hot `true` to hot reload
 */
async function startMicroLib ({ hot = false, serverless = false } = {}) {
  let remoteEntry = importFresh('./remoteEntry')
  const factory = await remoteEntry.microlib.get('./server')
  const serverModule = factory()
  if (hot) {
    // clear stale routes
    clearRoutes()
    // clear cache on hot reload
    serverModule.default.clear()
  }
  await serverModule.default.start(app, serverless)
  return serverModule.default.invoke
}

/**
 * Handle hot reload request. If running in cluster mode,
 * do a rolling restart instead of memory purge.
 */
function reloadCallback () {
  // Manual reset if left in wrong state
  app.use(`${hotReloadPath}-reset`, function (_req, res) {
    process.send({ cmd: 'reload-reset' })
    res.send('reload status reset...try again')
  })

  if (clusterEnabled) {
    app.use(hotReloadPath, async function (_req, res) {
      res.send('<h1>starting cluster reload</h1>')
      process.send({ cmd: 'reload' })
    })
    return
  }

  app.use(hotReloadPath, async function (_req, res) {
    try {
      // restart microlib
      await startMicroLib({ hot: true })
      res.send('<h1>hot reload complete</h1>')
    } catch (error) {
      console.error(error)
    }
  })
}

/**
 *
 * @param {*} provider
 * @param {*} messages
 */
function checkPublicIpAddress () {
  const bytes = []
  const proto = sslEnabled ? 'https' : 'http'
  const prt = sslEnabled ? sslPort : port

  if (/local/i.test(process.env.NODE_ENV)) {
    const ipAddr = 'localhost'
    console.log(`\n 🌎 ÆGIS listening on ${proto}://${ipAddr}:${prt} \n`)
    return
  }
  http.get(
    {
      hostname: publicIpCheckHost,
      method: 'get'
    },
    function (response) {
      response.on('data', chunk => bytes.push(chunk))
      response.on('end', function () {
        const ipAddr = bytes.join('').trim()
        console.log(`\n 🌎 ÆGIS listening on ${proto}://${ipAddr}:${p} \n`)
      })
    }
  )
}

/**
 * Attach {@link MeshService} to the API listener socket.
 * Listen for upgrade events from http server and switch
 * to WebSockets protocol. Clients connecting this way are
 * using the service mesh, not the API.
 *
 * @param {https.Server|http.Server} server
 */
function attachServiceMesh (server) {
  const wss = new websocket.Server({
    clientTracking: true,
    server: server,
    maxPayload: 104857600
  })
  wss.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request)
    })
  })
  MeshService.attachServer(wss)
}

/**
 * Programmatically provision CA cert using rfc
 * https://datatracker.ietf.org/doc/html/rfc8555
 *
 * {@link CertificateService} kicks off and handles a series of
 * automated id challenge tests conducted by the issuing CA.
 *
 * @param {*} domain
 * @param {*} domainEmail
 * @returns
 */
async function getWebPkixCert (domain, domainEmail, renewal = false) {
  if (
    !renewal &&
    fs.existsSync('cert/certificate.pem') &&
    fs.existsSync('cert/privatekey.pem')
  ) {
    return {
      key: fs.readFileSync('cert/privatekey.pem', 'utf8'),
      cert: fs.readFileSync('cert/certificate.pem', 'utf8')
    }
  }
  const { key, cert } = await CertificateService.provisionCert(
    domain,
    domainEmail
  )
  fs.writeFileSync('cert/certificate.pem', cert)
  fs.writeFileSync('cert/privatekey.pem', key)
}

/**
 * Using {@link tls.createSecureContext} to create/renew
 * certs without restarting the server
 *
 * @param {boolean} renewal
 * @returns
 */
async function createSecureContext (renewal = false) {
  const cert = await getWebPkixCert(domain, domainEmail, renewal)
  return tls.createSecureContext(cert)
}

/** the current cert/key pair */
let secureCtx

/**
 * Start web server, optionally require secure socket.
 */
async function startWebServer () {
  const shutdownOptions = {
    logger: console,
    forceTimeout: 30000
  }

  if (sslEnabled) {
    secureCtx = await createSecureContext()
    // create with `secureCtx` so we can renew certs without restarting the server
    const httpsServer = https.createServer(
      {
        SNICallback: (_, cb) => cb(null, secureCtx)
      },
      app
    )
    // update secureCtx to refresh certificate
    app.use(
      certLoadPath,
      async () => (secureCtx = await createSecureContext(true))
    )
    // graceful shutdown prevents new clients from connecting & waits
    // up to `shutdownOptions.forceTimeout` for them to disconnect
    app.use(graceful(httpsServer, shutdownOptions))
    // service mesh uses same port
    attachServiceMesh(httpsServer)
    // callback figures out public-facing addr
    httpsServer.listen(sslPort, checkPublicIpAddress)
  }
  // run unsecured port regardless
  const httpServer = http.createServer(app)
  app.use(graceful(httpServer, shutdownOptions))
  if (sslEnabled) {
    // set up a route to redirect http to https
    httpServer.get('*', function (req, res) {
      res.redirect('https://' + req.headers.host + req.url)
    })
  } else {
    attachServiceMesh(httpServer)
  }
  httpServer.listen(port, checkPublicIpAddress)
}

/**
 * start microlib and the webserver
 *
 * this function isn't called if running in serverless mode
 */
async function startService () {
  try {
    app.use(express.json())
    app.use(express.static('public'))
    await startMicroLib()
    reloadCallback()
    startWebServer()
  } catch (e) {
    console.error(e)
  }
}

if (!isServerless()) {
  if (clusterEnabled) {
    // Fork child processes (one per core)
    // children share socket descriptor (round-robin)
    ClusterService.start(startService)
  } else {
    startService()
  }
}

let serverlessAdapter

/**
 * Serverless function - entry point called by serverless platform.
 * @param  {...any} args - payload passed to serverless function
 */
exports.handleServerlessRequest = async function (...args) {
  console.info('serverless function called', args)
  if (!serverlessAdapter) {
    serverlessAdapter = await ServerlessAdapter(
      () => startMicroLib({ serverless: true }),
      cloudProvider
    )
  }
  serverlessAdapter.invokeController(...args)
}

const fileHandler = new StaticFileHandler('public')

/**
 * Serve static files, i.e. the demo app.
 * @param {*} event
 * @param {*} context
 * @returns
 */
exports.serveHtml = async (event, context) => {
  console.debug({ event, context })
  console.log(event.path)
  event.path = 'index.html'
  return fileHandler.get(event, context)
}
