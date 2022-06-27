var host;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	!function() {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = function(chunkId) {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce(function(promises, key) {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/readFile chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "0" means "already loaded", Promise means loading
/******/ 		var installedChunks = {
/******/ 			"host": 0
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = function(chunk) {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++) {
/******/ 				if(installedChunks[chunkIds[i]]) {
/******/ 					installedChunks[chunkIds[i]][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// ReadFile + VM.run chunk loading for javascript
/******/ 		__webpack_require__.f.readFileVm = function(chunkId, promises) {
/******/ 		
/******/ 			var installedChunkData = installedChunks[chunkId];
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 				// array of [resolve, reject, promise] means "currently loading"
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[2]);
/******/ 				} else {
/******/ 					if(true) { // all chunks have JS
/******/ 						// load the chunk and return promise to it
/******/ 						var promise = new Promise(async function(resolve, reject) {
/******/ 							installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 							var filename = require('path').join(__dirname, "" + __webpack_require__.u(chunkId));
/******/ 							var fs = require('fs');
/******/ 							if(fs.existsSync(filename)) {
/******/ 								console.log(filename,"exists locally")
/******/ 								fs.readFile(filename, 'utf-8', function(err, content) {
/******/ 									if(err) return reject(err);
/******/ 									var chunk = {};
/******/ 									require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\n})', filename)(chunk, require, require('path').dirname(filename), filename);
/******/ 									installChunk(chunk);
/******/ 								});
/******/ 							} else {
/******/ 		
/******/ 								    function loadScript(url,cb,chunkID) {
/******/ 								        var url;
/******/ 								        var cb = arguments[arguments.length - 1];
/******/ 								        if (typeof cb !== "function") {
/******/ 								            throw new Error("last argument should be a function");
/******/ 								        }
/******/ 								        if (arguments.length === 2) {
/******/ 								            url = arguments[0];
/******/ 								        } else if (arguments.length === 3) {
/******/ 								            url = new URL(arguments[1], arguments[0]).toString();
/******/ 								        } else {
/******/ 								            throw new Error("invalid number of arguments");
/******/ 								        }
/******/ 								      if(global.webpackChunkLoad){
/******/ 								        global.webpackChunkLoad(url).then(function(resp){
/******/ 								          return resp.text();
/******/ 								        }).then(function(rawData){
/******/ 								          cb(null, rawData);
/******/ 								        }).catch(function(err){
/******/ 								          console.error('Federated Chunk load failed', error);
/******/ 								          return cb(error)
/******/ 								        });
/******/ 								      } else {
/******/ 								        //TODO https support
/******/ 								        let request = (url.startsWith('https') ? require('https') : require('http')).get(url, function (resp) {
/******/ 								          if (resp.statusCode === 200) {
/******/ 								            let rawData = '';
/******/ 								            resp.setEncoding('utf8');
/******/ 								            resp.on('data', chunk => {
/******/ 								              rawData += chunk;
/******/ 								            });
/******/ 								            resp.on('end', () => {
/******/ 								              cb(null, rawData);
/******/ 								            });
/******/ 								          } else {
/******/ 								            cb(resp);
/******/ 								          }
/******/ 								        });
/******/ 								        request.on('error', error => {
/******/ 								          console.error('Federated Chunk load failed', error);
/******/ 								          return cb(error)
/******/ 								        });
/******/ 								      }
/******/ 								    }
/******/ 								console.log('needs to load remote script');
/******/ 								console.log('before remote var creation')
/******/ 								console.log('before remote var creation', undefined)
/******/ 								var remotes = undefined;
/******/ 								console.log('remotes in chunk load',remotes)
/******/ 								console.log('global.REMOTE_CONFIG',global.REMOTE_CONFIG)
/******/ 								if(global.REMOTE_CONFIG && !global.REMOTE_CONFIG["host"]) {
/******/ 								                            if(global.loadedRemotes){
/******/ 								                              for (const property in global.loadedRemotes) {
/******/ 								                                global.REMOTE_CONFIG[property] = global.loadedRemotes[property].path
/******/ 								                              }
/******/ 								                            }
/******/ 									Object.assign(global.REMOTE_CONFIG, remotes)
/******/ 								}
/******/ 								var requestedRemote = global.REMOTE_CONFIG["host"]
/******/ 								if(typeof requestedRemote === 'function'){
/******/ 								                              requestedRemote = await requestedRemote()
/******/ 								                            }
/******/ 								console.log('requestedRemote',requestedRemote);
/******/ 								var scriptUrl = new URL(requestedRemote.split("@")[1]);
/******/ 								var chunkName = __webpack_require__.u(chunkId);
/******/ 								console.log('remotes global',global.REMOTE_CONFIG);
/******/ 								console.log('chunkname to request',chunkName);
/******/ 								var fileToReplace = require('path').basename(scriptUrl.pathname);
/******/ 								scriptUrl.pathname = scriptUrl.pathname.replace(fileToReplace, chunkName);
/******/ 								console.log('will load remote chunk', scriptUrl.toString());
/******/ 								loadScript(scriptUrl.toString(), function(err, content) {
/******/ 									if(err) {console.error('error loading remote chunk', scriptUrl.toString(),'got',content); return reject(err);}
/******/ 									var chunk = {};
/******/ 									require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\n})', filename)(chunk, require, require('path').dirname(filename), filename);
/******/ 									installChunk(chunk);
/******/ 								});
/******/ 							}
/******/ 						});
/******/ 						promises.push(installedChunkData[2] = promise);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
!function() {
var exports = __webpack_exports__;
/*!***********************!*\
  !*** container entry ***!
  \***********************/
var moduleMap = {
	"./container": function() {
		return __webpack_require__.e("src_container_js").then(function() { return function() { return (__webpack_require__(/*! ./src/container.js */ "./src/container.js")); }; });
	}
};
var get = function(module, getScope) {
	__webpack_require__.R = getScope;
	getScope = (
		__webpack_require__.o(moduleMap, module)
			? moduleMap[module]()
			: Promise.resolve().then(function() {
				throw new Error('Module "' + module + '" does not exist in container.');
			})
	);
	__webpack_require__.R = undefined;
	return getScope;
};
var init = function(shareScope, initScope) {
	if (!__webpack_require__.S) return;
	var oldScope = __webpack_require__.S["default"];
	var name = "default"
	if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");
	__webpack_require__.S[name] = shareScope;
	return __webpack_require__.I(name, initScope);
};

// This exports getters to disallow modifications
__webpack_require__.d(exports, {
	get: function() { return get; },
	init: function() { return init; }
});
}();
host = __webpack_exports__;
/******/ })()
;