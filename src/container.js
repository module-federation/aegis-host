'use strict'

const aegis = __non_webpack_require__('./aegis.js')

async function init (router, options) {
  return aegis.default.start(router, options)
}

function dispose () {
  Object.keys(__non_webpack_require__.cache).forEach(k => {
    console.assert(!debug, 'deleting cached module', k)
    delete __non_webpack_require__.cache[k]
  })
}

module.exports = { init, dispose }
