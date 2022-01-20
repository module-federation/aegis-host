/**
 * @typedef {import("./remote-entries-type")} entry
 */

/** @type {entry} */
exports.customer = [
  {
    name: 'microservices',
    url: 'https://api.github.com',
    repo: 'microlib-examples',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'customer',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('microservices/models')
  }
]
