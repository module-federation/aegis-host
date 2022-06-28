"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "src_container_js";
exports.ids = ["src_container_js"];
exports.modules = {

/***/ "./src/container.js":
/*!**************************!*\
  !*** ./src/container.js ***!
  \**************************/
/***/ ((module) => {

eval("\n\nvar _non_webpack_require = require('@module-federation/aegis'),\n    aegis = _non_webpack_require.aegis;\n\nfunction init(remotes) {\n  return aegis.init(remotes);\n}\n\nfunction dispose() {\n  Object.keys(require.cache).forEach(function (k) {\n    console.debug('deleting cached module', k);\n    delete require.cache[k];\n  });\n}\n\nmodule.exports = {\n  init: init,\n  dispose: dispose\n};\n\n//# sourceURL=webpack://commonjs/./src/container.js?");

/***/ })

};
;