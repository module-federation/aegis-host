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
    importRemote: async () => import('local/models')
  },
  {
    name: 'adapters',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('local/adapters')
  },
  {
    name: 'services',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('local/services')
  },
  {
    name: 'ports',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'port',
    importRemote: async () => import('local/ports')
  }
]
