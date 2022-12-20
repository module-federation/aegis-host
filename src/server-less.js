'use strict'

const { aegis, adapters } = require('@module-federation/aegis')
const remotes = require('../dist/remoteEntry')
const { ServerlessAdapter } = adapters

/** @type {Promise<import('../webpack/remote-entries-type').remoteEntry[]>} */
const remoteEntries = remotes.get('./remoteEntries').then(factory => factory())

const adapter = remoteEntries
  .then(remotes => aegis.init(remotes))
  .then(handle => ServerlessAdapter()(handle))

/**
 * Serverless entry point. Configure the serverless platform
 * to call this function.
 */
exports.handleServerless = async function (...args) {
  return adapter.then(handle => handle(...args))
}
