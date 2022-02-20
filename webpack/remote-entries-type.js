/**
 * @typedef {object} remoteEntry points to a remote container (remoteEntry.js) of bundled modules
 * exposed for consumption at runtime as an import. Note .wasm files are not contained
 * in these bundles - the .wasm file is already optimized for size and statically linked to its
 * dependencies before frontend compilation. It can, however, be dynamically "linked" to other
 * modules at runtime via the Aegis framework, i.e. events, ports/adapters, relations, commands, etc
 * @property {string} name descriptive name of the entry
 * @property {string} [serviceName] optional name of the service to which the module belongs
 * - use to group model, adapaters and services together
 * @property {string} url location of the remoteEntry.js or .wasm file to be imported
 * - if using github, specify `https://api.github.com`
 * @property {string} [repo] if using github, name of the github repo
 * @property {string} [owner] if using gitbub, owner of the repo
 * @property {string} [filedir] if using gitub, path to the remoteEntry.js file
 * @property {string} [branch] if using github, branch of the repo to use, e.g. "master" or "main"
 * @property {string} path local path where compiled files are written
 * @property {boolean} [wasm] is this a WebAssembly module?
 * @property {number} [threads] suggested minimum threads to allocate in threadpool
 * to handle module workload
 * @property {boolean} [preload] if true, the threadpool creates threads
 * at startup instead of waiting until a request for the model has been received
 * @property {"model"|"adapter"|"service"} type the type of components in the module:
 * model, adapter or service
 * @property {function():Promise<object>} importRemote the function used to import the module
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
 */

const {
  importWebAssembly
} = require('@module-federation/aegis/lib/adapters/webassembly/wasm-import')

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
      importWebAssembly(this)
    },
  {
    name: 'computervision',
    url: 'https://machinelearning.cdn?asset=vision.wasm',
    path: __dirname,
    type: 'adapter',
    wasm: true,
    threads: 2,
    preload: true,
    importRemote () {
      importWebAssembly(this)
    }
  }
]
