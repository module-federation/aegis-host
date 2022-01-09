'use strict'

require('dotenv').config()
require('regenerator-runtime')
const serverless = /true/i.test(process.env.SERVERLESS)
const express = require('express')
const app = express()
const server = require('./server-old')
const aegis = require('@module-federation/aegis').aegis

async function load () {
  const remotes = require('../webpack/remote-entries')
  const service = await aegis.init()

  app.use(service.routes())
  return service
}

if (!serverless) {
  load().then(() => server.start(app))
}

let service
exports.handleServerless = async function (...args) {
  if (!service) service = await load()
  return service.handle(...args)
}
