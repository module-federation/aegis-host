/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.customer = [
  {
    name: 'customer',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'customer',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('customer/models')
  },
  {
    name: 'adapters',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'customer',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('customer/adapters')
  },
  {
    name: 'services',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'customer',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('customer/services')
  }
]
