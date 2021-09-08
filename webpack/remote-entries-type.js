/**
 * @typedef {object} remoteEntry points to remoteEntry.js file on remote server
 * @property {string} name name of the entry for users benefit
 * @property {string} [serviceName] name of the service to which the code to be imported belongs
 * - used to group model, adapaters and services together
 * @property {string} url location of the remoteEntry.js file to be imported
 * - if using github, just specify `https://api.github.com`
 * @property {string} [repo] if using github, name of the github repo
 * @property {string} [owner] if using gitbub, owner of the repo
 * @property {string} [filedir] if using gitub, path to the remoteEntry.js file
 * @property {string} [branch] if using github, branch of the repo to use, e.g. "master" or "main"
 * @property {string} path local path where compiled files are written
 * @property {"model"|"adapter"|"service"} type the type of components in the module
 * @property {function():Promise<object>} importRemote the function to call to import
 * @property {boolean} wasm is this a WebAssembly module?
 * @property {remoteEntry} model location of the model for webAssembly modules
 * - `await import("microservices/models")` imports models based on the below webpack.config.js
 * ```js
 * new ModuleFederationPlugin({
 *  name: "microservices",
 *  filename: "remoteEntry.js",
 *    library: {
 *    name: "microservices",
 *    type: "commonjs-module",
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

/** @type {remoteEntry[]} */
const entries = [{}, {}]

module.exports = entries
