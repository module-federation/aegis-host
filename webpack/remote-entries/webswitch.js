'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.order = [
  {
    name: 'webswitch',
    url: 'https://api.github.com',
    repo: 'aegis-app',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'webswitch',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('webswitch/models')
  },
  {
    name: 'adapters',
    url: 'https://api.github.com',
    repo: 'aegis-app',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'webswitch',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('webswitch/adapters')
  }
]
