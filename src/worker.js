'use strict'

require('regenerator-runtime')
const { workerData, parentPort } = require('worker_threads')
const { adapters, services, domain } = require('@module-federation/aegis')
const remote = require('../dist/remoteEntry')

const modelName = workerData.modelName
const { importRemotes, UseCaseService } = domain
const { StorageService } = services
const { StorageAdapter } = adapters
const { find, save } = StorageAdapter
const getRemoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

async function init (remotes) {
  try {
    const overrides = { find, save, StorageService }
    await importRemotes(remotes, overrides)
    //loadModels(modelName)
    return UseCaseService(modelName)
  } catch (error) {
    console.error(init.name, error)
  }
}

getRemoteEntries.then(remotes => {
  try {
    init(remotes).then(async service => {
      console.info('aegis worker thread running')

      parentPort.once('close', () => {
        console.info('thread exiting')
        process.exit(0)
      })

      parentPort.on('message', async event => {
        if (typeof service[event.name] === 'function') {
          const result = await service[event.name](event.data)
          parentPort.postMessage(JSON.parse(JSON.stringify(result)))
          return
        }
        console.warn(
          'event name does not refer to a service function',
          event.name
        )
      })
    })
  } catch (error) {
    console.error(__filename, error)
  }
})
