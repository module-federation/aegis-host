'use strict'

require('regenerator-runtime')
const { domain, adapters, services } = require('@module-federation/aegis')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const {
  importRemotes,
  UseCaseService,
  EventBrokerFactory,
  /** @type {import('@module-federation/aegis/lib/domain/datasource-factory').default} */
  DataSourceFactory,
  default: ModelFactory
} = domain
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = adapters.controllers
const overrides = { find, save, StorageService }
const modelName = workerData.modelName

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

/** @typedef {import('@module-federation/aegis/lib/domain/event').Event} Event */

/**
 * Functions called via the event channel.
 */
const commands = {
  shutdown: signal => process.exit(signal || 0),
  showData: () =>
    DataSourceFactory.listDataSources().map(([k]) =>
      DataSourceFactory.getDataSource(k).listSync()
    ),
  showEvents: () =>
    [...broker.getEvents()].map(([k, v]) => ({
      name: k,
      handlers: v.map(v => v.toString())
    }))
}

/**
 * Create a subchannel between this thread and the main thread that
 * is dedicated to sending and receivng events. Connect each thread-
 * local event {@link broker} to the channel as pub/sub `eventNames`
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire events from main in worker threads
    eventPort.onmessage = async msgEvent => {
      const event = msgEvent.data
      console.debug({ fn: connectEventChannel.name, event })

      await broker.notify('from_main', msgEvent.data)

      if (typeof commands[event.name] === 'function') {
        const result = await commands[event.name](event.data)
        if (result) {
          eventPort.postMessage(JSON.parse(JSON.stringify(result)))
        }
      }
    }
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
      parentPort.postMessage({ signal: 'aegis-up' })

      parentPort.on('message', async message => {
        // The message port is transfered
        if (message.eventPort instanceof MessagePort) {
          // load distributed cache
          await initCache().load()
          // send/recv events to/from main thread
          connectEventChannel(message.eventPort)
          return
        }

        // Call the use case function by `name`
        if (typeof service[message.name] === 'function') {
          const result = await service[message.name](message.data)
          // serialize & deserialize the result to get rid of functions
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
