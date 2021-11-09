'use strict'

/**
 * @typedef {import("./remote-entries-type")} entries
 */

const { importWebAssembly } = require('../../aegis/lib').adapters.webassembly

/** @type {entries} */
const entries = [
  {
    name: 'wasm',
    url: 'http://aegis.module-federation.org:8060',
    type: 'model',
    wasm: true,
    importRemote () {
      return importWebAssembly(this, 'model')
    }
  }
]

module.exports = entries

