'use strict'

/**
 * @typedef {import("./remote-entries-type")} entry
 */

const {
  importWebAssembly
} = require('@module-federation/aegis/lib/adapters/webassembly/wasm-import')

/** @type {entry} */
module.exports = [
  // {
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
  {
    name: 'wasm2',
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
  },
  {
    name: 'wasm',
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
  // {
  //   name: "wasm",
  //   url: "https://aegis.module-federation.org:8060/",
  //   path: __dirname,
  //   type: "model",
  //   wasm: true,
  //   importRemote() {
  //     return importWebAssembly(this, "model");
  //   }
  // },
]
