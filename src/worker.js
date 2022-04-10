'use strict'

require('regenerator-runtime')
const { domain, adapters, services } = require('@module-federation/aegis')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const {
  importRemotes,
  UseCaseService,
  EventBrokerFactory,
  DataSourceFactory,
  default: ModelFactory
} = domain
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = adapters.controllers
const overrides = { find, save, StorageService }
const modelName = String(workerData.modelName).toUpperCase()

const remoteEntries = remote.aegis
  .get('./remoteEntries')
  .then(factory => factory())

/**
 * - Import and bind remote models, adapters and services
 * - Generate service endpoints and storage adapters
 *
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

function parse (event) {
  try {
    if (typeof event === 'object') return JSON.parse(JSON.stringify(event))
    if (typeof event === 'string') return JSON.stringify(event)
  } catch (error) {
    console.log({ fn: parse.name, error })
  }
  return event
}

/**
 * Functions called via the event channel.
 */
const command = {
  shutdown: signal => process.exit(signal || 0),
  showData: () =>
    [DataSourceFactory.getDataSource(modelName)].map(ds => ({
      dsname: ds.name,
      records: ds.totalRecords()
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

async function runCommand (message) {
  const result = command[message.name](message.data)
  const response = result?.then ? await result : result
  parentPort.postMessage(parse(response))
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
    const broker = EventBrokerFactory.getInstance()

    // fire events from main in worker threads
    eventPort.onmessage = async msgEvent => {
      const event = msgEvent.data
      // check first if this is known command
      if (typeof command[event.name] === 'function') {
        await runCommand(event)
        return
      }
      event && (await broker.notify('from_main', event))
    }
    // forward worker events to the main thread
    broker.on('to_main', event => event && eventPort.postMessage(parse(event)))
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
      // notify main we are up + register our events with event router
      parentPort.postMessage({ metaEvent: 'aegis-up' })

      // handle requests from main
      parentPort.on('message', async message => {
        // The message port is transfered
        if (message.eventPort instanceof MessagePort) {
          // send/recv events to/from main thread
          connectEventChannel(message.eventPort)
          return
        }

        // Call the use case function by `name`
        if (typeof service[message.name] === 'function') {
          const result = await service[message.name](message.data)
          // serialize & deserialize the result to get  xid of functions
          parentPort.postMessage(parse(result || []))
        } else if (typeof command[message.name] === 'function') {
          return runCommand(message)
        } else {
          console.warn('not a service function', message.name)
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
