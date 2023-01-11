'use strict'

const helmet = require('helmet')
const expressAttack = require('express-attack')
const http = require('http')

function throttleStore () {
  const store = {}
  const get = async function (key) {
    return store[key]
  }
  const set = async function (key, timestamp, period) {
    store[key] = timestamp
  }

  return {
    get,
    set
  }
}

/**
 *
 * @param {http.ClientRequest} req
 * @returns
 */
function throttleByHost (req) {
  return {
    key: req.host,
    burst: 2,
    emissionInterval: 100
  }
}

exports.loadMiddleware = function (app) {
  app.use(helmet())
  app.disable('x-powered-by')

  app.use(
    expressAttack({
      throttles: [throttleByHost],
      store: throttleStore()
    })
  )
}
