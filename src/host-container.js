'use strict'

const { aegis } = __non_webpack_require__('@module-federation/aegis')

async function init (remotes) {
  return aegis.init(remotes)
}

async function dispose () {
  await aegis.dispose()

  Object.keys(__non_webpack_require__.cache).forEach(k => {
    delete __non_webpack_require__.cache[k]
  })
}

module.exports = { init, dispose }
