/**
 * @typedef {import("./remote-entries-type")} entry
 */

/** @type {entry} */
const entries = [
  {
    name: 'microservices',
    url: 'https://api.github.com',
    repo: 'microlib-example',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'master',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('microservices/models')
  }
]

module.exports = entries
