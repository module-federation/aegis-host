"use strict";
exports.id = "src_container_js";
exports.ids = ["src_container_js"];
exports.modules = {

/***/ "./src/container.js":
/*!**************************!*\
  !*** ./src/container.js ***!
  \**************************/
/***/ (function(module) {



var _non_webpack_require = require('@module-federation/aegis'),
    aegis = _non_webpack_require.aegis;

function init(remotes) {
  return aegis.init(remotes);
}

function dispose() {
  Object.keys(require.cache).forEach(function (k) {
    console.debug('deleting cached module', k);
    delete require.cache[k];
  });
}

module.exports = {
  init: init,
  dispose: dispose
};

/***/ })

};
;