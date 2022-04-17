'use strict'

require('regenerator-runtime')
const { domain, adapters, services } = require('@module-federation/aegis')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const { importRemotes, UseCaseService, EventBrokerFactory } = domain
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = adapters.controllers
const overrides = { find, save, StorageService }
const modelName = workerData.modelName?.toUpperCase()

if (!modelName) {
  console.error('no modelName specified!')
  process.exit(1)
}

/** @type {import('@module-federation/aegis/lib/domain/event-broker').EventBroker} */
const broker = EventBrokerFactory.getInstance()

const remoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

/**
 * Import and bind remote modules: i.e models, adapters and services
 * @param {import('../webpack/remote-entries-type.js').remoteEntry} remotes
 * @returns
 */
async function init (remotes) {
  try {
    await importRemotes(remotes, overrides)
    return UseCaseService(modelName)
  } catch (error) {
    w
    console.error({ fn: init.name, error })
  }
}

/**
 * Create a subchannel between this thread and the main thread that is dedicated
 * to inter-thread and inter-host events; that is, locally generated and handled
 * events and events from the service mesh. Connect both ends of the channel to
 * the thread-local {@link broker} via pub & sub events.
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire events from main in worker threads
    eventPort.onmessage = async msgEvent =>
      broker.notify('from_main', msgEvent.data)
    // forward worker events to the main thread
    broker.on('to_main', event =>
      eventPort.postMessage(JSON.parse(JSON.stringify(event)))
    )
  } catch (error) {
    console.error({ fn: connectEventChannel.name, error })
  }
}

remoteEntries.then(remotes => {
  try {
    init(remotes).then(async service => {
      console.info('aegis worker thread running')
      // load distributed cache and register its events
      await initCache().load()
      // notify main we are up
      parentPort.postMessage({ metaEvent: 'aegis-up' })

      // handle API requests from main
      parentPort.on('message', async message => {
        // Call the use case function by `name`
        if (typeof service[message.name] === 'function') {
          const result = await service[message.name](message.data)
          // serialize to get rid of functions/0
          parentPort.postMessage(JSON.parse(JSON.stringify(result || {})))
        } // The "event port" is transfered
        else if (message.eventPort instanceof MessagePort) {
          // send/recv events to/from main thread
          connectEventChannel(message.eventPort)
        } else {
          console.warn('not a service function', message)
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
