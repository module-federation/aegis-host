'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entries
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/** @type {entries[]} */
exports.go = [
  {
    name: 'go',
    url: 'http://localhost:8000/main.wasm',
    wasm: true,
    path: __dirname,
    type: 'model',
    importRemote () {
      return importWebAssembly(this)
    }
  }
]
