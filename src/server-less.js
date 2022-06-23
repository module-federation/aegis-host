'use strict'

const { aegis, adapters } = require('@module-federation/aegis')
const { ServerlessAdapter } = adapters

const adapter = ServerlessAdapter(aegis).then(adapter => adapter)

/**
 * Serverless entry point. Configure serverless platform
 * to call this method
 */
exports.handleServerless = async function (...args) {
  return adapter.then(adapter => adapter.handle(...args))
}
