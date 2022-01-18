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

const remoteEntries = remote.aegis
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

remoteEntries.then(remotes => {
  try {
    init(remotes).then(async service => {
      console.info('aegis worker thread running')

      parentPort.on('message', async event => {
        if (event.name === 'shutdown') {
          console.info('from worker: exiting')
          process.exit(0)
        }

        if (typeof service[event.name] === 'function') {
          const result = await service[event.name](event.data)
          parentPort.postMessage(JSON.parse(JSON.stringify(result)))
        } else {
          console.warn('not a service function', event.name)
        }
      })
    })
  } catch (error) {
    console.error(__filename, error)
  }
})
