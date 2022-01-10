'use strict'

require('dotenv').config()
require('regenerator-runtime')
const serverless = /true/i.test(process.env.SERVERLESS)
const express = require('express')
const app = express()
const aegis = require('@module-federation/aegis').aegis
const server = require('./server')
const remotes = require('../webpack/remote-entries')

async function load () {
  const host = await aegis.init(remotes, app)
  //app.use(host.path, host.routes)
  return host
}

if (!serverless) {
  load().then(() => server.start(app))
}

let host
exports.handleServerless = async function (...args) {
  if (!host) host = await load()
  return host.handle(...args)
}
