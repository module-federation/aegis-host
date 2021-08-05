var wasm;wasm =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "webpack/container/entry/wasm":
/*!***********************!*\
  !*** container entry ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__.d, __webpack_require__.o, __webpack_exports__, __webpack_require__.e, __webpack_require__, __webpack_require__.* */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var moduleMap = {
	"./domain": () => {
		return __webpack_require__.e(920).then(() => () => (__webpack_require__(/*! ./src/domain */ "./src/domain/index.js")));
	}
};
var get = (module) => {
	return (
		__webpack_require__.o(moduleMap, module)
			? moduleMap[module]()
			: Promise.resolve().then(() => {
				throw new Error('Module "' + module + '" does not exist in container.');
			})
	);
};
var init = (shareScope) => {
	var oldScope = __webpack_require__.S["default"];
	var name = "default"
	if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");
	__webpack_require__.S[name] = shareScope;
	return __webpack_require__.I(name);
};

// This exports getters to disallow modifications
__webpack_require__.d(exports, {
	get: () => get,
	init: () => init
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
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
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "https://api.github.com?owner=tysonrm&repo=assembnly-script-aegis&filedir=dist&branch=main";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/readFile chunk loading */
/******/ 	(() => {
/******/ 		
/******/ 		const { Octokit } = require("@octokit/rest");
/******/ 		const fs = require("fs");
/******/ 		const path = require("path");
/******/ 		const token = process.env.GITHUB_TOKEN;
/******/ 		
/******/ 		const octokit = new Octokit({ auth: token });
/******/ 		
/******/ 		function githubFetch(url) {
/******/ 		  console.info("github url", url);
/******/ 		  const owner = url.searchParams.get("owner");
/******/ 		  const repo = url.searchParams.get("repo");
/******/ 		  const filedir = url.searchParams.get("filedir");
/******/ 		  const branch = url.searchParams.get("branch");
/******/ 		  return new Promise(function (resolve, reject) {
/******/ 		    octokit
/******/ 		      .request(
/******/ 		        "GET /repos/{owner}/{repo}/contents/{filedir}?ref={branch}",
/******/ 		        {
/******/ 		          owner,
/******/ 		          repo,
/******/ 		          filedir,
/******/ 		          branch
/******/ 		        }
/******/ 		      )
/******/ 		      .then(function (rest) {
/******/ 		        const file = rest.data.find(d => "/" + d.name === url.pathname);
/******/ 		        return file.sha;
/******/ 		      })
/******/ 		      .then(function (sha) {
/******/ 		        console.log(sha);
/******/ 		        return octokit.request(
/******/ 		          "GET /repos/{owner}/{repo}/git/blobs/{sha}",
/******/ 		          {
/******/ 		            owner,
/******/ 		            repo,
/******/ 		            sha,
/******/ 		          }
/******/ 		        );
/******/ 		      })
/******/ 		      .then(function (rest) {
/******/ 		        resolve(Buffer.from(rest.data.content, "base64").toString("utf-8"));
/******/ 		      });
/******/ 		  });
/******/ 		}
/******/ 		function httpRequest(url) {
/******/ 		  if (/github/i.test(url.hostname)) 
/******/ 		    return githubFetch(url)
/******/ 		  return httpGet(url)
/******/ 		}
/******/ 		function httpGet(params) {
/******/ 		  return new Promise(function(resolve, reject) {
/******/ 		    var req = require(params.protocol.slice(0, params.protocol.length - 1)).request(params, function(res) {
/******/ 		      if (res.statusCode < 200 || res.statusCode >= 300) {
/******/ 		        return reject(new Error('statusCode=' + res.statusCode));
/******/ 		      }
/******/ 		      var body = [];
/******/ 		      res.on('data', function(chunk) {
/******/ 		        body.push(chunk);
/******/ 		      });
/******/ 		      res.on('end', function() {
/******/ 		        try {
/******/ 		          body = Buffer.concat(body).toString();
/******/ 		        } catch(e) {
/******/ 		          reject(e);
/******/ 		        }
/******/ 		        resolve(body);
/******/ 		      });
/******/ 		    });
/******/ 		    req.on('error', function(err) {
/******/ 		      reject(err);
/******/ 		    });
/******/ 		    req.end();
/******/ 		  });
/******/ 		}
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "0" means "already loaded", Promise means loading
/******/ 		var installedChunks = {
/******/ 			872: 0
/******/ 		};
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			var callbacks = [];
/******/ 			for(var i = 0; i < chunkIds.length; i++) {
/******/ 				if(installedChunks[chunkIds[i]])
/******/ 					callbacks = callbacks.concat(installedChunks[chunkIds[i]][0]);
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			for(i = 0; i < callbacks.length; i++)
/******/ 				callbacks[i]();
/******/ 		};
/******/ 		
/******/ 		// ReadFile + VM.run chunk loading for javascript
/******/ 		__webpack_require__.f.readFileVm = function(chunkId, promises) { console.log(">>>>>>>>>chunkId",chunkId);
/******/ 		
/******/ 			var installedChunkData = installedChunks[chunkId];
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 				// array of [resolve, reject, promise] means "currently loading"
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[2]);
/******/ 				} else {
/******/ 					if(true) { // all chunks have JS
/******/ 						// load the chunk and return promise to it
/******/ 						var promise = new Promise(function(resolve, reject) {
/******/ 							installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 							var chunkFileName = "/" + __webpack_require__.u(chunkId);
/******/ 							var url = new (require("url").URL)(__webpack_require__.p)
/******/ 							url.pathname = chunkFileName;
/******/ 							httpRequest(url)
/******/ 								.then((content) => {
/******/ 									var chunk = {};
/******/ 									require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\n})', chunkFileName)(chunk, require, __dirname, chunkFileName);
/******/ 									installChunk(chunk);
/******/ 								}).catch((err) => {
/******/ 									reject(err);
/******/ 								});
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
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("webpack/container/entry/wasm");
/******/ })()
;
//# sourceMappingURL=remoteEntry.js.map