'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.order = [
  {
    name: 'order',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'order',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('order/models')
  },
  {
    name: 'adapters',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'order',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('order/adapters')
  },
  {
    name: 'services',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'order',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('order/services')
  }
]
