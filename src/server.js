'use strict'

import { adapters, domain, services } from '@module-federation/aegis'

const { StorageAdapter, controllers } = adapters
const { ModelFactory } = domain
const { StorageService } = services

const {
  postModels,
  patchModels,
  getModels,
  getModelsById,
  deleteModels,
  initCache,
  getConfig,
  http
} = controllers

const apiRoot = process.env.API_ROOT || '/microlib/api'
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

const App = (() => {
  const routes = new RouteMap()

  const endpoint = e => `${modelPath}/${e}`
  const endpointId = e => `${modelPath}/${e}/:id`
  const endpointCmd = e => `${modelPath}/${e}/:id/:command`

  const remoteEntry = __non_webpack_require__('./remoteEntry')

  const getRemoteModules = remoteEntry.microlib
    .get('./domain')
    .then(factory => {
      const Module = factory()
      return Module.importRemotes
    })

  const getRemoteEntries = remoteEntry.microlib
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
    webserver (path, method, controllers, app) {
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
    serverless (path, method, controllers) {
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

    admin (adapter, serverMode, app) {
      if (serverMode === make.webserver.name) {
        app.get(`${apiRoot}/config`, adapter(getConfig()))
      } else if (serverMode === make.serverless.name) {
        routes.set(`${apiRoot}/config`, { get: adapter(getConfig()) })
        console.info(routes)
      }
    }
  }

  /**
   * Call controllers directly in serverless mode.
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

  function shutdown (shutdownTasks) {
    console.warn('Received SIGTERM - system shutdown in progress')
    shutdownTasks()
  }

  /**
   * Clear everything bundled by remoteEntry.js
   * (models & remoteEntry config), i.e. all the
   * user code downloaded from the remote. This is
   * the code that needs to be disposed of & reimported.
   */
  function clear () {
    try {
      // free resources
      StorageAdapter.close()
      // free wasm memory if any
      ModelFactory.clearModels()

      // purge everything we imported
      Object.keys(__non_webpack_require__.cache).forEach(k => {
        console.log('deleting cached module', k)
        delete __non_webpack_require__.cache[k]
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Import federated modules, see {@link getRemoteModules}. Then, generate
   * routes for each controller method and model. If running as a serverless
   * function, store the route-controller bindings for direct invocation via
   * the {@link invoke} method.
   *
   * @param {import("express").Router} router - express app/router
   * @param {boolean} serverless - set to true if running as a servless function
   * @returns
   */
  async function start (router, serverless = false) {
    const serverMode = serverless ? make.serverless.name : make.webserver.name
    const overrides = { ...StorageAdapter, StorageService }

    const label = '\ntotal time to import & register remote modules'
    console.time(label)

    return getRemoteEntries.then(remotes => {
      return getRemoteModules.then(importRemotes => {
        return importRemotes(remotes, overrides).then(async () => {
          const cache = initCache()

          console.info(`running in ${serverMode} mode`)

          make[serverMode](endpoint, 'get', getModels, router)
          make[serverMode](endpoint, 'post', postModels, router)
          make[serverMode](endpointId, 'get', getModelsById, router)
          make[serverMode](endpointId, 'patch', patchModels, router)
          make[serverMode](endpointId, 'delete', deleteModels, router)
          make[serverMode](endpointCmd, 'patch', patchModels, router)
          make.admin(http, serverMode, router)

          console.timeEnd(label)
          process.on('sigterm', () => shutdown(() => close()))
          await cache.load()
          return invoke
        })
      })
    })
  }

  return {
    clear,
    start,
    invoke
  }
})()

export default App
