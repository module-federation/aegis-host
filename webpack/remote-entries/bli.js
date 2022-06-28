'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.bli = [
  {
    name: 'bli',
    url: 'https://api.github.com',
    repo: 'aegis-app',
    owner: 'briteliteimmersive',
    filedir: 'dist',
    branch: 'master',
    path: __dirname,
    type: 'model',
    importRemote: async () => import('bli/models')
  },
  {
    name: 'adapters',
    url: 'https://api.github.com',
    repo: 'aegis-app',
    owner: 'briteliteimmersive',
    filedir: 'dist',
    branch: 'master',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => import('bli/adapters')
  },
  {
    name: 'services',
    url: 'https://api.github.com',
    repo: 'aegis-app',
    owner: 'briteliteimmersive',
    filedir: 'dist',
    branch: 'master',
    path: __dirname,
    type: 'service',
    importRemote: async () => import('bli/services')
  }
]
