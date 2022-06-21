const { aegis, adapters } = require('@module-federation/aegis')
const { ServerlessAdapter } = adapters

const adapter = ServerlessAdapter(aegis).then(adapter => adapter)

exports.handleServerless = async function (...args) {
  return adapter.then(adapter => adapter.handle(...args))
}
