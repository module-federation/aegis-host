'use strict'

/**
 * @typedef {import("./remote-entries-type")} entries
 */

const { importWebAssembly } = require('../../aegis/lib').adapters.webassembly

/** @type {entries} */
const entries = [
  {
    name: 'wasm',
    url: 'https://api.github.com',
    repo: 'aegis',
    owner: 'module-federation',
    filedir: 'wasm/build',
    branch: 'main',
    path: __dirname,
    type: 'model',
    wasm: true,
    importRemote () {
      return importWebAssembly(this, 'model')
    }
  }
]

module.exports = entries
