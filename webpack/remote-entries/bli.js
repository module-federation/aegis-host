'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.bli = [
  {
    name: 'bli',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('bli/models')
  },
  {
    name: 'adapters',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('bli/adapters')
  },
  {
    name: 'services',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('bli/services')
  },
  {
    name: 'ports',
    url: 'http://localhost:8000/remoteEntry.js',
    path: __dirname,
    type: 'port',
    importRemote: async () => import('bli/ports')
  }
]
