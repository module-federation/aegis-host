'use strict'

require('regenerator-runtime')
const { workerData, parentPort } = require('worker_threads')
const { adapters, services, domain } = require('@module-federation/aegis')
const remote = require('../dist/remoteEntry')

const modelName = workerData.modelName
const { importRemotes, UseCaseService, EventBrokerFactory } = domain
const { StorageAdapter, controllers } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = controllers
const overrides = { find, save, StorageService }
const broker = EventBrokerFactory.getInstance()

const remoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

/**
 * Import and bind remote modules: models, adapters and services
 * @param {import('../webpack/remote-entries-type.js').remoteEntry} remotes
 * @returns
 */
async function init (remotes) {
  try {
    const cache = initCache()
    await importRemotes(remotes, overrides)
    const service = UseCaseService(modelName)
    await cache.load()
    return service
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}
/**
 * Create a subchannel between this thread and the main thread that
 * is dedicated to sending and receivng events. Connect the thread-
 * local event broker of each thread to the channel such that
 * all worker-generated events are forwarded to main and all main-
 * generated events are forwarded to workers (without looping).
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire external events from main
    eventPort.onmessage = async event =>
      await broker.notify('EXTERNAL', event.data)

    // forward internal events to main
    broker.on(/.*/, event => eventPort.postMessage(event), {
      ignore: ['EXTERNAL']
    })
  } catch (error) {
    console.error({ fn: connectEventChannel.name, error })
  }
}

const externalEvents = {
  shutdown: n => process.exit(n || 0)
}

remoteEntries.then(remotes => {
  try {
    init(remotes).then(async service => {
      console.info('aegis worker thread running')
      parentPort.postMessage({ signal: 'aegis-up' })
      broker.on('EXTERNAL', e => externalEvents[e.name](e.data))

      parentPort.on('message', async message => {
        // The event port is transfered
        if (message.eventPort instanceof MessagePort) {
          connectEventChannel(message.eventPort)
          return
        }

        // Call the use case service named in the message                                                                                                                                                                                                                        q
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
