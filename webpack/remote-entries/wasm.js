'use strict'

/**
 * @typedef {import("../remote-entries-type")} entries
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/** @type {entries} */
exports.wasm = [
  {
    name: 'wasm',
    url: 'https://api.github.com',
    repo: 'aegis',
    owner: 'module-federation',
    filedir: 'wasm/build',
    branch: 'main',
    preload: false,
    wasm: true,
    path: __dirname,
    type: 'model',
    importRemote () {
      return importWebAssembly(this, 'model')
    }
  }
]
