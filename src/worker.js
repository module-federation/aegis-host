'use strict'

require('regenerator-runtime')
const { workerData, parentPort } = require('worker_threads')
const { adapters, services, domain } = require('@module-federation/aegis')
const remote = require('../dist/remoteEntry')

const modelName = workerData.modelName
const { importRemotes, UseCaseService, EventBrokerFactory } = domain
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const overrides = { find, save, StorageService }
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
    const service = UseCaseService(modelName)
    return service
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}

/**
 * Create a subchannel between this thread and the main thread that
 * is dedicated to sending and receivng events. Connect the thread-
 * local event broker of each thread to the channel such that
 * all worker-generated events are forwarded to main, except those
 * sent by main, which are to be handled as commands to the thread.
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire external events from main
    eventPort.onmessage = async msgEvent => await broker.notify('external', msgEvent)
    // forward internal events to main
    broker.on(
      /.*/,
      event => {
        console.debug('worker event fired, forward to main', event)
        return eventPort.postMessage(JSON.parse(JSON.stringify(event)))
      },
      {
        ignore: ['external']
      }
    )
  } catch (error) {
    console.error({ fn: connectEventChannel.name, error })
  }
}

const externalEvents = {
  shutdown: signal => process.exit(signal || 0),
  dispatch: event => broker.notify(event.eventName, event, { regexOff: true })
}

remoteEntries.then(remotes => {
  try { 
    init(remotes).then(async service => {
      console.info('aegis worker thread running')
      parentPort.postMessage({ signal: 'aegis-up' })
      broker.on('external', event => externalEvents[event.name](event.data))

      parentPort.on('message', async message => {
        // The message port is transfered
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
