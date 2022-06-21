'use strict'

require('regenerator-runtime')
const { domain, adapters, services } = require('@module-federation/aegis')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const { importRemotes, EventBrokerFactory } = domain
const DomainPorts = domain.UseCaseService
const { StorageAdapter } = adapters
const { StorageService } = services
const { find, save } = StorageAdapter
const { initCache } = adapters.controllers
const overrides = { find, save, ...StorageService }
const modelName = workerData.poolName.toUpperCase()

if (!modelName) {
  console.error('no modelName specified!')
  process.exit(1)
}

/** @type {import('@module-federation/aegis/lib/domain/event-broker').EventBroker} */
const broker = EventBrokerFactory.getInstance()

const remoteEntries = remote.get('./remoteEntries').then(factory => factory())

/**
 * Import and bind remote modules: i.e models, adapters and services
 * @param {import('../webpack/remote-entries-type.js').remoteEntry} remotes
 * @returns
 */
async function init (remotes) {
  try {
    // import federated modules
    await importRemotes(remotes, overrides)
    // get the inbound ports for this domain model
    return DomainPorts(modelName)
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}

/**
 * Create a subchannel between this thread and the main thread that is dedicated
 * to events, both inter-thread (raised by one thread and handled by another) and
 * inter-process (remotely generated and locally handled or vice versa). Inter-process
 * events (event from another host instance) are transmitted over the service mesh.
 * Custom user-defined events will also use this channel.
 *
 * Connect both ends of the channel to the thread-local {@link broker} via pub & sub events.
 *
 * Note that the event channel does not provide a "synchronous" response like the main channel.
 * In the main channel, the caller receives a promise that resolves with the output of the job.
 * This is what allows http clients to receive a response and complete a transaction in a single
 * http session.
 *
 * (Don't confuse async function execution in the event loop with the overall
 * transaction context, which starts when the server accepts a request and
 * ends once its returned a response to that request. This is what is meant
 * by "synchronous".
 *
 * If a synchronous response is needed for an event, which should be avoided,
 * it can be done by calling the `ThreadPool.run` function andnspecifying the
 * event channel (shown below). The event handler for this event must return
 * a response to the main thread.
 *
 * ```js
 * ThreadPool.run(jobName, jobData, { channel: EVENTCHANNEL })
 * ```
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire events from main
    eventPort.onmessage = async msgEvent => {
      // don't `await` the task
      console.debug({ fn: 'worker: eventPort.onmessage', data: msgEvent.data })
      broker.notify(msgEvent.data.eventName, msgEvent.data)
    }

    // forward events to main
    broker.on('to_main', event => {
      console.debug({ fn: 'worker:on:to_main', event })
      eventPort.postMessage(JSON.parse(JSON.stringify(event)))
    })
  } catch (error) {
    console.error({ fn: connectEventChannel.name, error })
  }
}

remoteEntries.then(remotes => {
  try {
    init(remotes).then(async domainPorts => {
      console.info('aegis worker thread running')
      // load distributed cache and register its events
      await initCache().load()
      // notify main we are up
      parentPort.postMessage({ metaEvent: 'aegis-up' })

      // handle API requests from main
      parentPort.on('message', async message => {
        // Look for a use case function called `message.name`
        if (typeof domainPorts[message.name] === 'function') {
          try {
            // invoke an inbound port (a.k.a use case function)
            const result = await domainPorts[message.name](message.data)
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
          console.warn('not a domain port', message)
          // main is expecting a response
          parentPort.postMessage({ error: 'not a function', message })
        }
      })
    })
  } catch (error) {
    console.error({ remoteEntries, error })
  }
})
