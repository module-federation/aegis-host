// 'use strict'

// const apiRoot = process.env.API_ROOT || '/aegis/api'
// const modelPath = `${apiRoot}/models`

// const idRoute = route =>
//   route
//     .split('/')
//     .splice(5, 1)
//     .concat([':id'])
//     .join('/')

// const idParam = route =>
//   route
//     .split('/')
//     .splice(5, 2)
//     .map(p => ({ ['id']: p }))

// const cmdRoute = route =>
//   route
//     .split('/')
//     .splice(0, 5)
//     .concat([':id', ':command'])
//     .join('/')

// const cmdParams = route =>
//   route
//     .split('/')
//     .splice(5, 2)
//     .map((p, i) => ({ [['id', 'command'][i]]: p }))

// /**
//  * Store routes and their controllers
//  * @extends {Map}
//  */
// class RouteMap extends Map {
//   // match (route) {
//   //   const routeParts = route.split('/')
//   //   super.keys.forEach(function (template) {
//   //     const templateParts = template.split('/')

//   //     if (routeParts.length !== templateParts.length) return false

//   //     if (routeParts.every((r, i) => r === templateParts[i])) {
//   //       this.route = template
//   //       return true
//   //     }
//   //   })
//   // }

//   has (route) {
//     if (!route) {
//       console.warn('route is ', typeof route)
//       return false
//     }

//     if (super.has(route)) {
//       this.route = super.get(route)
//       return true
//     }

//     // /microlib/api/models/orders/:id
//     const idInstance = idRoute(route)
//     if (route.match(/\//g).length === 5 && super.has(idInstance)) {
//       this.route = super.get(idInstance)
//       this.params = idParam(route)
//       return true
//     }

//     // /microlib/api/models/orders/:id/:command
//     const cmdInstance = cmdRoute(route)
//     if (route.match(/\//g).length === 6 && super.has(cmdInstance)) {
//       this.route = super.get(cmdInstance)
//       this.params = cmdParams(route)
//       return true
//     }
//     return false
//   }

//   get (route) {
//     return this.route ? this.route : super.get(route)
//   }

//   getPathParams () {
//     return this.params ? this.params : {}
//   }
// }

// /**
//  * Application entry point
//  *
//  * - {@link Aegis.start} import remotes, generate APIs
//  * - {@link Aegis.invoke} call controllers directly
//  * - {@link Aegis.clear} dispose of module cache
//  */
// const Aegis = (() => {
//   const endpoint = e => `${modelPath}/${e}`
//   const endpointId = e => `${modelPath}/${e}/:id`
//   const endpointCmd = e => `${modelPath}/${e}/:id/:command`

//   const make = {
//     /**
//      * webserver mode - create routes and register controllers
//      * @param {*} path
//      * @param {*} app
//      * @param {*} method
//      * @param {*} controllers
//      */
//     express (routes, path, method, controllers, http, app) {
//       controllers().forEach(ctlr => {
//         console.info(ctlr)
//         app[method](path(ctlr.endpoint), http(ctlr.fn))
//       })
//     },

//     /**
//      * serverless mode - execute controllers directly
//      * @param {*} path
//      * @param {*} method
//      * @param {*} controllers
//      */
//     aegis (routes, path, method, controllers, http) {
//       controllers().forEach(ctlr => {
//         const route = path(ctlr.endpoint)
//         if (routes.has(route)) {
//           routes.set(route, {
//             ...routes.get(route),
//             [method]: http(ctlr.fn)
//           })
//           return
//         }
//         routes.set(route, { [method]: http(ctlr.fn) })
//       })
//     },

//     admin (routes, adapter, serverMode, getConfig, app) {
//       if (serverMode === make.express.name) {
//         app.get(`${apiRoot}/config`, adapter(getConfig()))
//       } else if (serverMode === make.aegis.name) {
//         routes.set(`${apiRoot}/config`, { get: adapter(getConfig()) })
//         console.info(routes)
//       }
//     }
//   }

//   /**
//    * Call controllers directly. Useful in serverless mode.
//    * @param {string} path url path
//    * @param {'post'|'get'|'patch'|'delete'} method method name
//    * @param {import('express').Request} req
//    * @param {import('express').Response} res
//    * @returns
//    */
//   async function invokeController (routes, path, method, req, res) {
//     if (path === '/') return
//     if (routes.has(path)) {
//       try {
//         const controller = routes.get(path)[method.toLowerCase()]
//         req.params = routes.getPathParams()
//         if (typeof controller === 'function') {
//           await controller(req, res)
//           return
//         }
//         console.error('controller is not a function', controller)
//       } catch (error) {
//         console.error('problem running controller', error)
//         res.writeHead(500, error.message)
//         return
//       }
//     }
//     console.warn('potential config issue', path, method)
//     res.writeHead(404, 'not found')
//   }

//   function handleBody (req, body) {
//     if (body.length > 0) body = JSON.parse(Buffer.concat(body).toString())
//     req.body = body
//   }

//   function handleSearchParams (req) {
//     req.query = {}
//     const url = new URL(`${req.protocol}://${req.hostname}${req.url}`)
//     url.searchParams.forEach(p => p && (req.query = { ...req.query, p }))
//   }

//   async function handleServerless (...args) {}

//   /**
//    *
//    * @param {import('node:http').ClientRequest} req
//    * @param {import('node:http').ServerResponse} res
//    * @returns
//    */
//   function handleRequest (routes) {
//     return async function (req, res) {
//       return new Promise(function (resolve, reject) {
//         let body = []
//         try {
//           req.on('data', function (data) {
//             body.push(data)
//           })
//           req.on('end', async function () {
//             handleBody(req, body)
//             handleSearchParams(req)
//             await invokeController(routes, req.path, req.method, req, res)
//             resolve(res)
//           })
//         } catch (e) {
//           console.error(handleRequest.name, e)
//           res.writeHead(500, e.message)
//           reject(error)
//         }
//       })
//     }
//   }

//   function shutdown () {
//     console.warn('Received SIGTERM - app shutdown in progress')
//   }

//   function setRoutes (routes, adapters, style, router) {
//     const {
//       http,
//       postModels,
//       patchModels,
//       getModels,
//       getModelsById,
//       deleteModels,
//       getConfig
//     } = adapters.controllers

//     make[style](routes, endpoint, 'get', getModels, http, router)
//     make[style](routes, endpoint, 'post', postModels, http, router)
//     make[style](routes, endpointId, 'get', getModelsById, http, router)
//     make[style](routes, endpointId, 'patch', patchModels, http, router)
//     make[style](routes, endpointId, 'delete', deleteModels, http, router)
//     make[style](routes, endpointCmd, 'patch', patchModels, http, router)
//     make.admin(routes, http, style, getConfig, router)
//   }

//   /**
//    * Import federated modules, see {@link getRemoteModels}. Then, generate
//    * routes for each controller method and model. If running as a serverless
//    * function, store the route-controller bindings for direct invocation via
//    * the {@link invoke} method.
//    *
//    * @param {import("express").Router} router - express app/router
//    * @param {boolean} serverless - set to true if running as a servless function
//    * @returns
//    */
//   async function start (remoteEntry) {
//     const routes = new RouteMap()

//     const getRemoteServices = remoteEntry.aegis
//       .get('./services')
//       .then(factory => factory())

//     const getRemoteAdapters = remoteEntry.aegis
//       .get('./adapters')
//       .then(factory => factory())

//     const getRemoteModels = remoteEntry.aegis.get('./domain').then(factory => {
//       const Module = factory()
//       return Module.importRemotes
//     })

//     const getRemoteEntries = remoteEntry.aegis
//       .get('./remoteEntries')
//       .then(factory => factory())

//     return getRemoteServices.then(services => {
//       return getRemoteAdapters.then(adapters => {
//         const { initCache } = adapters.controllers
//         const { StorageAdapter } = adapters
//         const { find, save } = StorageAdapter
//         const { StorageService } = services
//         const overrides = { save, find, StorageService }

//         const label = '\ntotal time to import & register remote modules'
//         console.time(label)

//         return getRemoteEntries.then(remotes => {
//           return getRemoteModels.then(importRemotes => {
//             return importRemotes(remotes, overrides).then(async () => {
//               const cache = initCache()

//               // const style = router ? make.express.name : make.aegis.name
//               // console.info(`using ${style} router`)

//               setRoutes(routes, adapters, make.aegis.name, null)

//               console.timeEnd(label)
//               process.on('SIGTERM', shutdown)
//               await cache.load()

//               return {
//                 handleServerless,
//                 handle: handleRequest(routes),
//                 adapters,
//                 services
//               }
//             })
//           })
//         })
//       })
//     })
//   }

//   return {
//     start
//   }
// })()

// export default Aegis
