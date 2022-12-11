'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.fdp = [
  {
    name: 'fdp',
    url: 'http://localhost:8003/remoteEntry.js',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('fdp/models')
  },
  {
    name: 'adapters',
    url: 'http://localhost:8003/remoteEntry.js',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('fdp/adapters')
  },
  {
    name: 'services',
    url: 'http://localhost:8003/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('fdp/services')
  },
  {
    name: 'ports',
    url: 'http://localhost:8003/remoteEntry.js',
    path: __dirname,
    type: 'port',
    importRemote: async () => import('fdp/ports')
  }
]
