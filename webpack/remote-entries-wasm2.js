'use strict'

/**
 * @typedef {import("./remote-entries-type")} entry
 */

const {
  importWebAssembly
} = require('@module-federation/aegis').adapters.webassembly

/** @type {entry} */
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
//{
//   name: 'wasm-spec',
//   url: 'https://api.github.com',
//   repo: 'aegis',
//   owner: 'module-federation',
//   filedir: 'wasm/build',
//   branch: 'wasm-model',
//   path: __dirname,
//   type: 'model',
//   wasm: true,
//   model: {
//     name: 'wasm-model',
//     url: 'https://api.github.com',
//     repo: 'aegis',
//     owner: 'module-federation',
//     filedir: 'wasm/build/model',
//     branch: 'wasm-model',
//     path: __dirname,
//     type: 'model'
//   },
//   importRemote () {
//     return importWebAssembly(this, 'model')
//   }
// }