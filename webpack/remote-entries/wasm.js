'use strict'

/**
 * @typedef {import("../remote-entries-type").remoteEntry} entries
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/** @type {entries[]} */
exports.wasm = [
  {
    name: 'wasm',
    url: 'https://api.github.com',
    repo: 'aegis',
    owner: 'briteliteimmersive',
    filedir: 'wasm/build',
    branch: 'main',
    wasm: true,
    path: __dirname,
    type: 'model',
    importRemote() {
      return importWebAssembly(this)
    }
  }
]
