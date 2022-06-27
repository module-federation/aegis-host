'use strict'

const { aegis } = __non_webpack_require__('@module-federation/aegis')

function init (remotes) {
  return aegis.init(remotes)
}

function dispose () {
  Object.keys(__non_webpack_require__.cache).forEach(k => {
    console.debug('deleting cached module', k)
    delete __non_webpack_require__.cache[k]
  })
}

module.exports = { init, dispose }
