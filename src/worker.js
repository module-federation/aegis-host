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
  const overrides = { find, save, StorageService }
  await importRemotes(remotes, overrides)
  //loadModels(modelName)
  return UseCaseService(modelName)
}

getRemoteEntries.then(remotes => {
  init(remotes).then(async service => {
    console.info('aegis worker thread running')
    parentPort.on('message', async event => {
      const result = await service[event.name](event.data)
      parentPort.postMessage(JSON.parse(JSON.stringify(result)))
    })
  })
})
