'use strict'

const aegis = __non_webpack_require__('./aegis.js')
const remoteEntry = __non_webpack_require__('./remoteEntry')

async function init () {
  return aegis.default.start(remoteEntry)
}

function dispose () {
  Object.keys(__non_webpack_require__.cache).forEach(k => {
    console.debug('deleting cached module', k)
    delete __non_webpack_require__.cache[k]
  })
}

module.exports = { init, dispose }
