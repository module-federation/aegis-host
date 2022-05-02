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
const overrides = { find, save, ...StorageService }
const modelName = workerData.modelName.toUpperCase()

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
    console.error({ fn: init.name, error })
  }
}

/**
 * Create a subchannel between this thread and the main thread that is dedicated
 * to inter-thread and inter-host events; that is, locally generated and handled
 * events and events from the service mesh. Connect both ends of the channel to
 * the thread-local {@link broker} via pub & sub events.
 *
 * The event channel has no synchronous response like the main channel. Don't confuse
 * the event loop and async functions, which support concurrency, with the transaction
 * context. The client receives a synchronous response.
 *
 * The event channel can kick off work that sends events back to main (e.g. destined
 * for the service mesh). Therefore, waiting for an event to complete could result
 * in a deadlock. For this reason, unlike the main channel, we do not await a downstream
 * response. We do however use the pool's thread managment algorithm to select an idle
 * thread initially. But we release it immediately by responding back the main thread
 * and let the event loop sort out the execution.
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire events from main
    eventPort.onmessage = async msgEvent => {
      // don't wait for the task to complete
      broker.notify(msgEvent.data.eventName, msgEvent.data)
      eventPort.postMessage({ msg: 'continue' })
    }

    // forward events to main
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
        // Look for a use case function called `message.name`
        if (typeof service[message.name] === 'function') {
          try {
            // invoke the use case function
            const result = await service[message.name](message.data)
            // serialize `result` to get rid of any functions
            parentPort.postMessage(JSON.parse(JSON.stringify(result || {})))
          } catch (error) {
            console.error('worker:', error)
          }
          // The "event port" is transfered
        } else if (message.eventPort instanceof MessagePort) {
          // send/recv events to/from main thread
          connectEventChannel(message.eventPort)
        } else {
          console.warn('not a service function', message)
          // main is expecting a response
          parentPort.postMessage({ error: 'not a function', message })
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
