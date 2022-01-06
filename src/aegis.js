'use strict'

const apiRoot = process.env.API_ROOT || '/aegis/api'
const modelPath = `${apiRoot}/models`

const idRoute = route =>
  route
    .split('/')
    .splice(0, 5)
    .concat([':id'])
    .join('/')

const cmdRoute = route =>
  route
    .split('/')
    .splice(0, 6)
    .concat([':id', ':command'])
    .join('/')

/**
 * Store routes and their controllers
 * @extends {Map}
 */
class RouteMap extends Map {
  has (route) {
    if (!route) {
      console.warn('route is ', typeof route)
      return false
    }

    if (super.has(route)) {
      this.route = super.get(route)
      return true
    }

    const idInstance = idRoute(route)
    if (route.match(/\//g).length === 5 && super.has(idInstance)) {
      this.route = super.get(idInstance)
      return true
    }

    const cmdInstance = cmdRoute(route)
    if (route.match(/\//g).length === 6 && super.has(cmdInstance)) {
      this.route = super.get(cmdInstance)
      return true
    }
    return false
  }

  get (route) {
    return this.route ? this.route : super.get(route)
  }
}

/**
 * Application entry point
 *
 * - {@link aegis.start} import remotes, generate APIs
 * - {@link aegis.invoke} call controllers directly
 * - {@link aegis.clear} dispose of module cache
 */
const aegis = (() => {
  const routes = new RouteMap()

  const endpoint = e => `${modelPath}/${e}`
  const endpointId = e => `${modelPath}/${e}/:id`
  const endpointCmd = e => `${modelPath}/${e}/:id/:command`

  const remoteEntry = require('./remoteEntry.js')

  const getRemoteServices = remoteEntry.aegis
    .get('./services')
    .then(factory => factory())

  const getRemoteAdapters = remoteEntry.aegis
    .get('./adapters')
    .then(factory => factory())

  const getRemoteModels = remoteEntry.aegis.get('./domain').then(factory => {
    const Module = factory()
    return Module.importRemotes
  })

  const getRemoteEntries = remoteEntry.aegis
    .get('./remoteEntries')
    .then(factory => factory())

  const make = {
    /**
     * webserver mode - create routes and register controllers
     * @param {*} path
     * @param {*} app
     * @param {*} method
     * @param {*} controllers
     */
    webserver (path, method, controllers, app, http) {
      controllers().forEach(ctlr => {
        console.info(ctlr)
        app[method](path(ctlr.endpoint), http(ctlr.fn))
      })
    },

    /**
     * serverless mode - execute controllers directly
     * @param {*} path
     * @param {*} method
     * @param {*} controllers
     */
    serverless (path, method, controllers, http) {
      controllers().forEach(ctlr => {
        const route = path(ctlr.endpoint)
        if (routes.has(route)) {
          routes.set(route, {
            ...routes.get(route),
            [method]: http(ctlr.fn)
          })
          return
        }
        routes.set(route, { [method]: http(ctlr.fn) })
      })
    },

    admin (adapter, serverMode, getConfig, app) {
      if (serverMode === make.webserver.name) {
        app.get(`${apiRoot}/config`, adapter(getConfig()))
      } else if (serverMode === make.serverless.name) {
        routes.set(`${apiRoot}/config`, { get: adapter(getConfig()) })
        console.info(routes)
      }
    }
  }

  /**
   * Call controllers directly when in serverless mode.
   * @param {string} path
   * @param {string} method method name
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async function invoke (path, method, req, res) {
    if (routes.has(path)) {
      try {
        const controller = routes.get(path)[method]

        if (typeof controller === 'function') {
          return await controller(req, res)
        }
        console.error('controller is not a function', controller)
      } catch (error) {
        console.error('problem running controller', error)
      }
    }
    console.warn('potential config issue', path, method)
  }

  function shutdown () {
    console.warn('Received SIGTERM - app shutdown in progress')
  }

  /**
   * Import federated modules, see {@link getRemoteModels}. Then, generate
   * routes for each controller method and model. If running as a serverless
   * function, store the route-controller bindings for direct invocation via
   * the {@link invoke} method.
   *
   * @param {import("express").Router} router - express app/router
   * @param {boolean} serverless - set to true if running as a servless function
   * @returns
   */
  async function start (router, { serverless = false } = {}) {
    return getRemoteServices.then(services => {
      return getRemoteAdapters.then(adapters => {
        const {
          http,
          postModels,
          patchModels,
          getModels,
          getModelsById,
          deleteModels,
          getConfig,
          initCache
        } = adapters.controllers

        const { StorageAdapter } = adapters
        const { find, save } = StorageAdapter
        const overrides = { save, find, StorageAdapter }

        const serverMode = serverless
          ? make.serverless.name
          : make.webserver.name

        const label = '\ntotal time to import & register remote modules'
        console.time(label)

        return getRemoteEntries.then(remotes => {
          return getRemoteModels.then(importRemotes => {
            return importRemotes(remotes, overrides).then(async () => {
              const cache = initCache()

              console.info(`running in ${serverMode} mode`)

              make[serverMode](endpoint, 'get', getModels, router, http)
              make[serverMode](endpoint, 'post', postModels, router, http)
              make[serverMode](endpointId, 'get', getModelsById, router, http)
              make[serverMode](endpointId, 'patch', patchModels, router, http)
              make[serverMode](endpointId, 'delete', deleteModels, router, http)
              make[serverMode](endpointCmd, 'patch', patchModels, router, http)
              make.admin(http, serverMode, getConfig, router, http)

              console.timeEnd(label)
              process.on('SIGTERM', shutdown)
              await cache.load()

              return {
                invoke,
                router,
                adapters,
                services
              }
            })
          })
        })
      })
    })
  }

  return {
    start,
    invoke
  }
})()

export default aegis
