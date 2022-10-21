'use strict'

require('regenerator-runtime')
const { domain, adapters } = require('@module-federation/aegis')
const { workerData, parentPort } = require('worker_threads')
const remote = require('../dist/remoteEntry')

const {
  importRemotes,
  EventBrokerFactory,
  AppError,
  makeDomain,
  requestContext
} = domain

const { initCache } = adapters.controllers

/** @type {import('@module-federation/aegis/lib/domain/event-broker').EventBroker} */
const broker = EventBrokerFactory.getInstance()

/** @type {Promise<import('../webpack/remote-entries-type').remoteEntry[]>} */
const remoteEntries = remote.get('./remoteEntries').then(factory => factory())

/**
 * Import and bind remote modules: i.e. models, adapters and services
 * @param {import('../webpack/remote-entries-type.js').remoteEntry[]} remotes
 * @returns
 */
async function init (remotes) {
  try {
    // import federated modules; override as needed
    await importRemotes(remotes)
    // get the inbound ports for this domain
    return makeDomain(workerData.poolName.toUpperCase())
  } catch (error) {
    console.error({ fn: init.name, error })
  }
}

/**
 * Create a subchannel between this thread and the main thread that is dedicated
 * to events, both inter-thread (raised by one thread and handled by another) and
 * inter-process (remotely generated and locally handled or vice versa). Inter-process
 * events (event from another host instance) are transmitted over the service mesh.
 *
 * Connect both ends of the channel to the thread-local {@link broker} via pub & sub events.
 *
 * Unlike the main channel, the event channel is not meant to return a response to the caller.
 * If a response is needed, call `ThreadPool.run` as shown below.
 *
 * ```js
 * ThreadPool.runJob(jobName, jobData, { channel: EVENTCHANNEL })
 * ```
 *
 * @param {MessagePort} eventPort
 */
function connectEventChannel (eventPort) {
  try {
    // fire events from main
    eventPort.onmessage = msgEvent =>
      broker.notify(msgEvent.data.eventName, msgEvent.data)

    // forward events to main
    broker.on('to_main', event =>
      eventPort.postMessage(JSON.parse(JSON.stringify(event)))
    )
  } catch (error) {
    console.error({ fn: connectEventChannel.name, error })
  }
}

remoteEntries.then(remotes => {
  init(remotes).then(domainPorts => {
    console.info('aegis worker thread running')

    // dont wait for cache to load
    initCache().load()

    // handle API requests from main
    parentPort.on('message', async msg => {
      // Look for a use case function called `message.name`
      try {
        console.log('received msg', { msg, domainPorts })

        if (msg.data) {
          console.log('modelName', msg.data.modelName)

          const domainPort = domainPorts[msg.data.modelName][msg.name]

          if (typeof domainPort === 'function')
            try {
              // set context for this request
              requestContext.enterWith(new Map(msg.data.context))

              // invoke an inbound port method on this domain model
              const result = await domainPort(msg.data.jobData)

              parentPort.postMessage(JSON.parse(JSON.stringify(result || {})))
            } catch (error) {
              throw new Error(error)
            } finally {
              // tear down context
              requestContext.exit(x => x)
            }
        } else if (msg.eventPort instanceof MessagePort)
          // send/recv events to/from main thread
          connectEventChannel(msg.eventPort)
        // no response expected
        else if (msg.name === 'ping')
          // answer ping with received message
          parentPort.postMessage(msg.data.jobData)
        else
          throw new Error(`not a port function: ${msg}`)
      } catch (error) {
        // catch so we dont kill the thread
        console.error({ fn: 'worker', error })

        // main is expecting a response
        parentPort.postMessage(AppError(error, error.code))
      }
    })
  })
})
