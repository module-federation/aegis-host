'use strict'

'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entries
 */

const { importPython } = require('@module-federation/aegis').adapters.python

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entry
 */

/** @type {entry[]} */
exports.order = [
  {
    name: 'python',
    url: 'https://api.github.com',
    repo: 'rustpython',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'main',
    path: __dirname,
    wasm: true,
    type: 'model',
    importRemote () {
      return importPython(this)
    }
  }
]
