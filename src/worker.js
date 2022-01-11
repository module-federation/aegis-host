'use strict'

require('regenerator-runtime')
const { workerData, parentPort } = require('worker_threads')
const { adapters, services, domain } = require('@module-federation/aegis')
const { importRemotes } = domain
const { UseCaseService } = domain
const modelName = workerData.modelName
const { StorageService } = services
const { StorageAdapter } = adapters
const { find, save } = StorageAdapter
const remote = require('../dist/remoteEntry')
const getRemoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

async function init (remotes) {
  const overrides = { find, save, StorageService }
  //const modelService = remotes.filter(r => r.service === modelName)
  await importRemotes(remotes, overrides)
  //loadModels(modelName)
  return UseCaseService(modelName)
}

getRemoteEntries.then(remotes => {
  init(remotes).then(async service => {
    console.log('aegis worker thread running')
    parentPort.on('message', async event => {
      const result = await service[event.function](event.data)
      parentPort.postMessage(result)
    })
  })
})
