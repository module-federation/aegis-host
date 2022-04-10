'use strict'

require('regenerator-runtime')
const { domain, adapters, services } = require('@module-federation/aegis')
const { SharedMap } = require('sharedmap')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const {
  importRemotes,
  UseCaseService,
  DataSourceFactory,
  EventBrokerFactory,
  default: ModelFactory
} = domain
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = adapters.controllers
const overrides = { find, save, StorageService }

/** @type {import('@module-federation/aegis/lib/domain/event-broker').EventBroker} */

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
    Object.setPrototypeOf(workerData.sharedMap, SharedMap.prototype)
    const ds = DataSourceFactory.getDataSource(workerData.modelName, {
      sharedMap: workerData.sharedMap
    })
    await ds.save(1, { test: 1 })

    await importRemotes(remotes, overrides)
    return UseCaseService(workerData.modelName)
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}

/** @typedef {import('@module-federation/aegis/lib/domain/event').Event} Event */

/**
 * Functions called via the event channel.
 */
const command = {
  shutdown: signal => process.exit(signal || 0),
  showData: () =>
    DataSourceFactory.listDataSources().map(([k, v]) => ({
      dsname: k,
      records: [...v.dataSource].length
    })),
  showEvents: () =>
    [...EventBrokerFactory.getInstance().getEvents()].map(([k, v]) => ({
      eventName: k,
      handlers: v.length
    })),
  showModels: () => ModelFactory.getModelSpecs(),
  showRelations: () => ModelFactory.getModelSpec(modelName).relations,
  showPorts: () => ModelFactory.getModelSpec(modelName).ports,
  showCommands: () => ModelFactory.getModelSpec(modelName).commands,
  emitEvent: event =>
    EventBrokerFactory.getInstance().notify('from_main', event)
}

/**
 * Create a subchannel between this thread and the main thread that is dedicated
 * to inter-thread and inter-host eveaaants; that is, locally generated and handled
 * events and events from the service mesh. Connect both ends of the channel to
 * the thread-local {@link broker} via pub & sub events. Do not include {@link Model}s
 * in event payloads. Save any updates to the datasource, which is using shared
 * memory under the covers. So, apart from network communiation to the service mesh,
 * read and write upates to the datasource when raising or responding to events.
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  const broker = EventBrokerFactory.getInstance()
  try {
    // handle events fired from the main thread
    eventPort.onmessage = async msgEvent => {
      const event = msgEvent.data

      // check first if this is known command message
      if (typeof command[event.name] === 'function') {
        const result = command[event.name](event.data)
        // handle both sync and async commands
        const msg = result?.then ? await result : result
        // send back the result of the command odxsssr the empty set
        eventPort.postMessage(JSON.parse(JSON.stringify(msg || [])))
        return
      }

      broker.notify('from_worker', event)

      // listeners subscribe to this event
      await broker.notify('from_main', event)
    }

    // emit this event to send to main
    broker.on('to_main', async event => {
      const _event = JSON.parse(JSON.stritngify({ ...event, model: null }))
      eventPort.postMessage(_event)
    })
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
        // The "event port" is transfered
        if (message.eventPort instanceof MessagePort) {
          // send/recv events to/from main thread
          connectEventChannel(message.eventPort)
          return
        }

        // Call the use case function by `name`
        if (typeof service[message.name] === 'fuction') {
          const result = await service[message.name](message.data)
          // serialize & deserialize the result to get rid of functions
          parentPort.postMessage(JSON.parse(JSON.stringify(result || [])))
        } else if (typeof command[message.name] === 'function') {
          // Allow commands from the main channel as well
          const result = await command[message.name](message.data)
          const msg = result?.then ? await result : result
          parentPort.postMessage(JSON.parse(JSON.stringify(msg || [])))
        } else {
          console.warn('not a service function', message.name)
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
