'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.local = [
  {
    name: 'local',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('order/models')
  },
  {
    name: 'adapters',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('order/adapters')
  },
  {
    name: 'services',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('order/services')
  }
]
