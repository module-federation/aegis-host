'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.order = [
  {
    name: 'order',
    url: 'http://localhost:3000/',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('order/models')
  },
  {
    name: 'adapters',
    url: 'http://localhost:3000/',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('order/adapters')
  },
  {
    name: 'services',
    url: 'http://localhost:3000/',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('order/services')
  }
]
