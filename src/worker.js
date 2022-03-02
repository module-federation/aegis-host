'use strict'

require('regenerator-runtime')
const { workerData, parentPort } = require('worker_threads')
const { adapters, services, domain } = require('@module-federation/aegis')
const remote = require('../dist/remoteEntry')

const modelName = workerData.modelName
const { importRemotes, UseCaseService, EventBrokerFactory } = domain
const { StorageService } = services
const { StorageAdapter } = adapters
const { find, save } = StorageAdapter
const overrides = { find, save, StorageService }
const broker = EventBrokerFactory.getInstance()

const remoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

async function init (remotes) {
  try {
    await importRemotes(remotes, overrides)
    return UseCaseService(modelName)
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}

/**
 * @param {MessagePort} port
 */
function connectEventChannel (port) {
  // recv from main
  port.onmessage = msg =>
    broker.notify(msg.data.name, msg.data, { from: 'main' })
  // subscribe to subscription event and send to main
  broker.onSubscription(modelName, event =>
    port.postMessage({ event, modelName })
  )
  // send to main
  broker.on(/.*/, event => port.postMessage(event))
}

remoteEntries.then(remotes => {
  try {
    init(remotes).then(async service => {
      console.info('aegis worker thread running')
      parentPort.postMessage({ signal: 'aegis-up' })
      broker.on('shutdown', n => process.exit(n || 0), { from: 'main' })

      parentPort.on('message', async message => {
        if (message.eventPort instanceof MessagePort) {
          connectEventChannel(message.eventPort)
          return
        }
        if (typeof service[message.name] === 'function') {
          const result = await service[message.name](message.data)
          parentPort.postMessage(JSON.parse(JSON.stringify(result)))
        } else {
          console.warn('not a service function', message.name)
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
