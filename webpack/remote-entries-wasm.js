'use strict'

/**
 * @typedef {import("./remote-entries-type")} entries
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/** @type {entries} */
const entries = [
  {
    name: 'wasm2',
    url: 'https://api.github.com',
    repo: 'assembly',
    owner: 'tysonrm',
    filedir: 'build',
    branch: 'master',
    path: __dirname,
    type: 'model',
    wasm: true,
    importRemote () {
      return importWebAssembly(this, 'model')
    }
  }
]

module.exports = entries
