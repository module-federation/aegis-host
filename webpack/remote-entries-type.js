/**
 * @typedef {object} remoteEntry points to a manifest (remoteEntry.js) of remote modules
 * exposed for consumption at runtime. Note .wasm files are not contained in these bundles
 * as they are already optimized for size and statically linked to their dependencies.
 * It can, however, be dynamically "linked" to other modules at runtime via the Aegis
 * framework, i.e. events, ports/adapters, relations, commands, etc
 * @property {string} name descriptive name of the entry
 * @property {string} url location of the remoteEntry.js or .wasm file to be imported
 * - if using github, specify `https://api.github.com`
 * @property {string} path local path where compiled files are written
 * @property {"model"|"adapter"|"service"} type the type of components in the module
 * * @property {function():Promise<object>} importRemote the function used to import the module
 * - `await import("microservices/models")` imports models based on the below webpack.config.js
 *
 * ```js
 * new ModuleFederationPlugin({
 *  name: "microservices",
 *  filename: "remoteEntry.js",
 *    library: {
 *      name: "microservices",
 *      type: "commonjs-module",
 *  },
 *  remoteType: "commonjs-module",
 *  exposes: {
 *    "./models": "./src/domain",
 *    "./adapters": "./src/adapters",
 *    "./services": "./src/services",
 *   },
 * }),
 * ```
 * @property {string} [repo] if using github, name of the github repo
 * @property {string} [owner] if using gitbub, owner of the repo
 * @property {string} [filedir] if using gitub, path to the remoteEntry.js file
 * @property {string} [branch] if using github, branch of the repo to use, e.g. "master" or "main"
 * @property {boolean} [wasm] is this a WebAssembly module?
 * @property {string} [serviceName] optional name of the service to which the module belongs
 * - use to group model, adapaters and services together
 * at startup instead of waiting until a request for the model has been received
 * model, adapter or service
 * @property {string} [worker] Creates a model that is controlled by a custom worker
 * instead of the system default worker. Developers can do whatever they want with the worker 
 * and needn't use the associated model at all. That said, developers may want to make use of
 * the auto-generated APIs and storage, which are exposed at a lower level, allowing 
 * for more extensive customization.
 * 
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/**
 * Example entries showing
 *
 * @type {remoteEntry[]}
 */
exports.crowdcontrol = [
  {
    name: 'crowdcontrol',
    url: 'https://api.github.com',
    repo: 'crowdcontrol',
    owner: 'smartdistrict',
    filedir: 'dist',
    branch: 'beta',
    path: __dirname,
    type: 'model',
    importRemote: () => import('crowdcontrol/models')
  },
  {
    name: 'livestream',
    url: 'https://cctv.local/streams.wasm',
    path: __dirname,
    type: 'adapter',
    wasm: true,
    importRemote () {
      return importWebAssembly(this)
    }
  },
  {
    name: 'computervision',
    url: 'https://machinelearning.cdn?asset=vision.wasm',
    path: __dirname,
    type: 'adapter',
    wasm: true,
    importRemote () {
      return importWebAssembly(this)
    }
  }
]
