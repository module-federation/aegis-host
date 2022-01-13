'use strict'

require('dotenv').config()
require('regenerator-runtime')
const isServerless = /true/i.test(process.env.SERVERLESS)
const app = require('express')()
const aegis = require('@module-federation/aegis').aegis
const server = require('./server')
const remotes = require('../webpack/remote-entries')
const adapters = require('@module-federation/aegis').adapters
const { ServerlessAdapter } = adapters

if (!isServerless) {
  aegis.init(remotes, app).then(() => server.start(app))
}

const adapter = isServerless
  ? aegis
      .init(remotes)
      .then(aegis => ServerlessAdapter(aegis))
      .then(adapter => adapter)
  : (async (x = { handle: () => console.log('set env var SERVERLESS=true') }) =>
      x)()

exports.handleServerless = async function (...args) {
  return adapter.then(async adapter => adapter.handle(...args))
}
