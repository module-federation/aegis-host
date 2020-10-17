module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/asap/asap.js":
/*!***********************************!*\
  !*** ./node_modules/asap/asap.js ***!
  \***********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 16:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var rawAsap = __webpack_require__(/*! ./raw */ "./node_modules/asap/raw.js");
var freeTasks = [];

/**
 * Calls a task as soon as possible after returning, in its own event, with
 * priority over IO events. An exception thrown in a task can be handled by
 * `process.on("uncaughtException") or `domain.on("error")`, but will otherwise
 * crash the process. If the error is handled, all subsequent tasks will
 * resume.
 *
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawTask.domain = process.domain;
    rawAsap(rawTask);
}

function RawTask() {
    this.task = null;
    this.domain = null;
}

RawTask.prototype.call = function () {
    if (this.domain) {
        this.domain.enter();
    }
    var threw = true;
    try {
        this.task.call();
        threw = false;
        // If the task throws an exception (presumably) Node.js restores the
        // domain stack for the next event.
        if (this.domain) {
            this.domain.exit();
        }
    } finally {
        // We use try/finally and a threw flag to avoid messing up stack traces
        // when we catch and release errors.
        if (threw) {
            // In Node.js, uncaught exceptions are considered fatal errors.
            // Re-throw them to interrupt flushing!
            // Ensure that flushing continues if an uncaught exception is
            // suppressed listening process.on("uncaughtException") or
            // domain.on("error").
            rawAsap.requestFlush();
        }
        // If the task threw an error, we do not want to exit the domain here.
        // Exiting the domain would prevent the domain from catching the error.
        this.task = null;
        this.domain = null;
        freeTasks.push(this);
    }
};



/***/ }),

/***/ "./node_modules/asap/raw.js":
/*!**********************************!*\
  !*** ./node_modules/asap/raw.js ***!
  \**********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === "function";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Avoids a function call
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
    // Ensure flushing is not bound to any domain.
    // It is not sufficient to exit the domain, because domains exist on a stack.
    // To execute code outside of any domain, the following dance is necessary.
    var parentDomain = process.domain;
    if (parentDomain) {
        if (!domain) {
            // Lazy execute the domain module.
            // Only employed if the user elects to use domains.
            domain = __webpack_require__(/*! domain */ "domain");
        }
        domain.active = process.domain = null;
    }

    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
    // cannot handle recursion.
    // `requestFlush` will only be called recursively from `asap.js`, to resume
    // flushing after an error is thrown into a domain.
    // Conveniently, `setImmediate` was introduced in the same version
    // `process.nextTick` started throwing recursion errors.
    if (flushing && hasSetImmediate) {
        setImmediate(flush);
    } else {
        process.nextTick(flush);
    }

    if (parentDomain) {
        domain.active = process.domain = parentDomain;
    }
}


/***/ }),

/***/ "./node_modules/axios-proxy-fix/index.js":
/*!***********************************************!*\
  !*** ./node_modules/axios-proxy-fix/index.js ***!
  \***********************************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] -> ./node_modules/axios-proxy-fix/lib/axios.js */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios-proxy-fix/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/adapters/http.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/adapters/http.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 19:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios-proxy-fix/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios-proxy-fix/lib/helpers/buildURL.js");
var http = __webpack_require__(/*! http */ "http");
var https = __webpack_require__(/*! https */ "https");
var httpFollow = __webpack_require__(/*! follow-redirects */ "./node_modules/follow-redirects/index.js").http;
var httpsFollow = __webpack_require__(/*! follow-redirects */ "./node_modules/follow-redirects/index.js").https;
var url = __webpack_require__(/*! url */ "url");
var zlib = __webpack_require__(/*! zlib */ "zlib");
var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios-proxy-fix/package.json");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios-proxy-fix/lib/core/createError.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios-proxy-fix/lib/core/enhanceError.js");

var isHttps = /https:?/;

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolve, reject) {
    var data = config.data;
    var headers = config.headers;
    var timer;
    var aborted = false;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/mzabriskie/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = new Buffer(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = new Buffer(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var parsed = url.parse(config.url);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method,
      headers: headers,
      agent: agent,
      auth: auth
    };

    var proxy = config.proxy;
    if (!proxy) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        proxy = {
          host: parsedProxyUrl.hostname,
          port: parsedProxyUrl.port
        };

        if (parsedProxyUrl.auth) {
          var proxyUrlAuth = parsedProxyUrl.auth.split(':');
          proxy.auth = {
            username: proxyUrlAuth[0],
            password: proxyUrlAuth[1]
          };
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;

      // Basic proxy authorization
      if (proxy.auth) {
        var base64 = new Buffer(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (aborted) return;

      // Response has been received so kill timer that handles request timeout
      clearTimeout(timer);
      timer = null;

      // uncompress the response body transparently if required
      var stream = res;
      switch (res.headers['content-encoding']) {
      /*eslint default-case:0*/
      case 'gzip':
      case 'compress':
      case 'deflate':
        // add the unzipper to the body stream processing pipeline
        stream = stream.pipe(zlib.createUnzip());

        // remove the content-encoding in order to not confuse downstream operations
        delete res.headers['content-encoding'];
        break;
      }

      // return the last request in case of redirects
      var lastRequest = res.req || req;

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString('utf8');
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (aborted) return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout && !timer) {
      timer = setTimeout(function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
        aborted = true;
      }, config.timeout);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (aborted) {
          return;
        }

        req.abort();
        reject(cancel);
        aborted = true;
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/adapters/xhr.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/adapters/xhr.js ***!
  \**********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 11:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios-proxy-fix/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios-proxy-fix/lib/helpers/buildURL.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios-proxy-fix/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios-proxy-fix/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios-proxy-fix/lib/core/createError.js");
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(/*! ./../helpers/btoa */ "./node_modules/axios-proxy-fix/lib/helpers/btoa.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if ( true &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios-proxy-fix/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/axios.js":
/*!***************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/axios.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 49:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios-proxy-fix/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios-proxy-fix/lib/core/Axios.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios-proxy-fix/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios-proxy-fix/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios-proxy-fix/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios-proxy-fix/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios-proxy-fix/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/cancel/Cancel.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/cancel/Cancel.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 19:0-14 */
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/cancel/CancelToken.js":
/*!****************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/cancel/CancelToken.js ***!
  \****************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 57:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios-proxy-fix/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/cancel/isCancel.js":
/*!*************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/cancel/isCancel.js ***!
  \*************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/Axios.js":
/*!********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/Axios.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 79:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios-proxy-fix/lib/defaults.js");
var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios-proxy-fix/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios-proxy-fix/lib/core/dispatchRequest.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/InterceptorManager.js":
/*!*********************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/InterceptorManager.js ***!
  \*********************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 52:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/createError.js":
/*!**************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/createError.js ***!
  \**************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios-proxy-fix/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/dispatchRequest.js":
/*!******************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/dispatchRequest.js ***!
  \******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 25:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios-proxy-fix/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios-proxy-fix/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios-proxy-fix/lib/defaults.js");
var isAbsoluteURL = __webpack_require__(/*! ./../helpers/isAbsoluteURL */ "./node_modules/axios-proxy-fix/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ./../helpers/combineURLs */ "./node_modules/axios-proxy-fix/lib/helpers/combineURLs.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/enhanceError.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/enhanceError.js ***!
  \***************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/settle.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/settle.js ***!
  \*********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 12:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios-proxy-fix/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/core/transformData.js":
/*!****************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/core/transformData.js ***!
  \****************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/defaults.js":
/*!******************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/defaults.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 92:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios-proxy-fix/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios-proxy-fix/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios-proxy-fix/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios-proxy-fix/lib/adapters/http.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/bind.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/bind.js ***!
  \**********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/btoa.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/btoa.js ***!
  \**********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 36:0-14 */
/***/ ((module) => {

"use strict";


// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/buildURL.js":
/*!**************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/buildURL.js ***!
  \**************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/combineURLs.js":
/*!*****************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/combineURLs.js ***!
  \*****************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 10:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/cookies.js":
/*!*************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/cookies.js ***!
  \*************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/isAbsoluteURL.js":
/*!*******************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/isAbsoluteURL.js ***!
  \*******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/isURLSameOrigin.js":
/*!*********************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/isURLSameOrigin.js ***!
  \*********************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/normalizeHeaderName.js":
/*!*************************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/normalizeHeaderName.js ***!
  \*************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/parseHeaders.js":
/*!******************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/parseHeaders.js ***!
  \******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 27:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios-proxy-fix/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/helpers/spread.js":
/*!************************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/helpers/spread.js ***!
  \************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/lib/utils.js":
/*!***************************************************!*\
  !*** ./node_modules/axios-proxy-fix/lib/utils.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 282:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios-proxy-fix/lib/helpers/bind.js");
var isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./node_modules/axios-proxy-fix/package.json":
/*!***************************************************!*\
  !*** ./node_modules/axios-proxy-fix/package.json ***!
  \***************************************************/
/*! default exports */
/*! export _from [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _id [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _inBundle [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _integrity [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _location [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _phantomChildren [provided] [no usage info] [missing usage info prevents renaming] */
/*!   exports [not provided] [no usage info] */
/*! export _requested [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export escapedName [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export fetchSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export raw [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export rawSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export registry [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export saveSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _requiredBy [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _resolved [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _shasum [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _spec [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _where [provided] [no usage info] [missing usage info prevents renaming] */
/*! export author [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export browser [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export ./lib/adapters/http.js [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bugs [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bundleDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*! export dependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export follow-redirects [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export is-buffer [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export deprecated [provided] [no usage info] [missing usage info prevents renaming] */
/*! export description [provided] [no usage info] [missing usage info prevents renaming] */
/*! export devDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export coveralls [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export es6-promise [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-banner [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-cli [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-contrib-clean [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-contrib-nodeunit [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-contrib-watch [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-eslint [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-karma [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-ts [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export istanbul-instrumenter-loader [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export jasmine-core [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-chrome-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-coverage [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-firefox-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-jasmine [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-jasmine-ajax [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-opera-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-phantomjs-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-safari-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sauce-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sinon [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sourcemap-loader [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export load-grunt-tasks [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export minimist [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export phantomjs-prebuilt [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export sinon [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export typescript [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url-search-params [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export webpack-dev-server [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export homepage [provided] [no usage info] [missing usage info prevents renaming] */
/*! export keywords [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 1 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 2 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 3 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 4 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export license [provided] [no usage info] [missing usage info prevents renaming] */
/*! export main [provided] [no usage info] [missing usage info prevents renaming] */
/*! export name [provided] [no usage info] [missing usage info prevents renaming] */
/*! export repository [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export scripts [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export build [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export coveralls [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export examples [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export postversion [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export start [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export test [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export version [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export typings [provided] [no usage info] [missing usage info prevents renaming] */
/*! export version [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"_from\":\"axios-proxy-fix@^0.16.3\",\"_id\":\"axios-proxy-fix@0.16.3\",\"_inBundle\":false,\"_integrity\":\"sha512-dLRTjqYW7A9kuqh3aiFjvQrBSQipVwsHFV401MdQb2JhQS9rAobAMhME2GxZXNXDblWRGCVfW/LdoHUXrPFBRg==\",\"_location\":\"/axios-proxy-fix\",\"_phantomChildren\":{},\"_requested\":{\"type\":\"range\",\"registry\":true,\"raw\":\"axios-proxy-fix@^0.16.3\",\"name\":\"axios-proxy-fix\",\"escapedName\":\"axios-proxy-fix\",\"rawSpec\":\"^0.16.3\",\"saveSpec\":null,\"fetchSpec\":\"^0.16.3\"},\"_requiredBy\":[\"/smartystreets-javascript-sdk\"],\"_resolved\":\"https://registry.npmjs.org/axios-proxy-fix/-/axios-proxy-fix-0.16.3.tgz\",\"_shasum\":\"6a015d9fd14c16bc613f713980745bfb71a82666\",\"_spec\":\"axios-proxy-fix@^0.16.3\",\"_where\":\"/Users/tmidboeus.ibm.com/federated-monolith-services/node_modules/smartystreets-javascript-sdk\",\"author\":{\"name\":\"Moe Jangda\"},\"browser\":{\"./lib/adapters/http.js\":\"./lib/adapters/xhr.js\"},\"bugs\":{\"url\":\"https://github.com/mistermoe/axios/issues\"},\"bundleDependencies\":false,\"dependencies\":{\"follow-redirects\":\"^1.2.3\",\"is-buffer\":\"^1.1.5\"},\"deprecated\":false,\"description\":\"Promise based HTTP client for the browser and node.js\",\"devDependencies\":{\"coveralls\":\"^2.11.9\",\"es6-promise\":\"^4.0.5\",\"grunt\":\"^1.0.1\",\"grunt-banner\":\"^0.6.0\",\"grunt-cli\":\"^1.2.0\",\"grunt-contrib-clean\":\"^1.0.0\",\"grunt-contrib-nodeunit\":\"^1.0.0\",\"grunt-contrib-watch\":\"^1.0.0\",\"grunt-eslint\":\"^19.0.0\",\"grunt-karma\":\"^2.0.0\",\"grunt-ts\":\"^6.0.0-beta.3\",\"grunt-webpack\":\"^1.0.18\",\"istanbul-instrumenter-loader\":\"^1.0.0\",\"jasmine-core\":\"^2.4.1\",\"karma\":\"^1.3.0\",\"karma-chrome-launcher\":\"^2.0.0\",\"karma-coverage\":\"^1.0.0\",\"karma-firefox-launcher\":\"^1.0.0\",\"karma-jasmine\":\"^1.0.2\",\"karma-jasmine-ajax\":\"^0.1.13\",\"karma-opera-launcher\":\"^1.0.0\",\"karma-phantomjs-launcher\":\"^1.0.0\",\"karma-safari-launcher\":\"^1.0.0\",\"karma-sauce-launcher\":\"^1.1.0\",\"karma-sinon\":\"^1.0.5\",\"karma-sourcemap-loader\":\"^0.3.7\",\"karma-webpack\":\"^1.7.0\",\"load-grunt-tasks\":\"^3.5.2\",\"minimist\":\"^1.2.0\",\"phantomjs-prebuilt\":\"^2.1.7\",\"sinon\":\"^1.17.4\",\"typescript\":\"^2.0.3\",\"url-search-params\":\"^0.6.1\",\"webpack\":\"^1.13.1\",\"webpack-dev-server\":\"^1.14.1\"},\"homepage\":\"https://github.com/mistermoe/axios\",\"keywords\":[\"xhr\",\"http\",\"ajax\",\"promise\",\"node\"],\"license\":\"MIT\",\"main\":\"index.js\",\"name\":\"axios-proxy-fix\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/mistermoe/axios.git\"},\"scripts\":{\"build\":\"NODE_ENV=production grunt build\",\"coveralls\":\"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js\",\"examples\":\"node ./examples/server.js\",\"postversion\":\"git push && git push --tags\",\"start\":\"node ./sandbox/server.js\",\"test\":\"grunt test\",\"version\":\"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json\"},\"typings\":\"./index.d.ts\",\"version\":\"0.16.3\"}");

/***/ }),

/***/ "./node_modules/axios-retry/index.js":
/*!*******************************************!*\
  !*** ./node_modules/axios-retry/index.js ***!
  \*******************************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/index */ "./node_modules/axios-retry/lib/index.js").default;

/***/ }),

/***/ "./node_modules/axios-retry/lib/index.js":
/*!***********************************************!*\
  !*** ./node_modules/axios-retry/lib/index.js ***!
  \***********************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! export exponentialDelay [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isIdempotentRequestError [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isNetworkError [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isNetworkOrIdempotentRequestError [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isRetryableError [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isSafeRequestError [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isNetworkError = isNetworkError;
exports.isRetryableError = isRetryableError;
exports.isSafeRequestError = isSafeRequestError;
exports.isIdempotentRequestError = isIdempotentRequestError;
exports.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
exports.exponentialDelay = exponentialDelay;
exports.default = axiosRetry;

var _isRetryAllowed = __webpack_require__(/*! is-retry-allowed */ "./node_modules/is-retry-allowed/index.js");

var _isRetryAllowed2 = _interopRequireDefault(_isRetryAllowed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var namespace = 'axios-retry';

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isNetworkError(error) {
  return !error.response && Boolean(error.code) && // Prevents retrying cancelled requests
  error.code !== 'ECONNABORTED' && // Prevents retrying timed out requests
  (0, _isRetryAllowed2.default)(error); // Prevents retrying unsafe errors
}

var SAFE_HTTP_METHODS = ['get', 'head', 'options'];
var IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['put', 'delete']);

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isRetryableError(error) {
  return error.code !== 'ECONNABORTED' && (!error.response || error.response.status >= 500 && error.response.status <= 599);
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isSafeRequestError(error) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return isRetryableError(error) && SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1;
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isIdempotentRequestError(error) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return isRetryableError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1;
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isNetworkOrIdempotentRequestError(error) {
  return isNetworkError(error) || isIdempotentRequestError(error);
}

/**
 * @return {number} - delay in milliseconds, always 0
 */
function noDelay() {
  return 0;
}

/**
 * @param  {number} [retryNumber=0]
 * @return {number} - delay in milliseconds
 */
function exponentialDelay() {
  var retryNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var delay = Math.pow(2, retryNumber) * 100;
  var randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + randomSum;
}

/**
 * Initializes and returns the retry state for the given request/config
 * @param  {AxiosRequestConfig} config
 * @return {Object}
 */
function getCurrentState(config) {
  var currentState = config[namespace] || {};
  currentState.retryCount = currentState.retryCount || 0;
  config[namespace] = currentState;
  return currentState;
}

/**
 * Returns the axios-retry options for the current request
 * @param  {AxiosRequestConfig} config
 * @param  {AxiosRetryConfig} defaultOptions
 * @return {AxiosRetryConfig}
 */
function getRequestOptions(config, defaultOptions) {
  return Object.assign({}, defaultOptions, config[namespace]);
}

/**
 * @param  {Axios} axios
 * @param  {AxiosRequestConfig} config
 */
function fixConfig(axios, config) {
  if (axios.defaults.agent === config.agent) {
    delete config.agent;
  }
  if (axios.defaults.httpAgent === config.httpAgent) {
    delete config.httpAgent;
  }
  if (axios.defaults.httpsAgent === config.httpsAgent) {
    delete config.httpsAgent;
  }
}

/**
 * Adds response interceptors to an axios instance to retry requests failed due to network issues
 *
 * @example
 *
 * import axios from 'axios';
 *
 * axiosRetry(axios, { retries: 3 });
 *
 * axios.get('http://example.com/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * // Exponential back-off retry delay between requests
 * axiosRetry(axios, { retryDelay : axiosRetry.exponentialDelay});
 *
 * // Custom retry delay
 * axiosRetry(axios, { retryDelay : (retryCount) => {
 *   return retryCount * 1000;
 * }});
 *
 * // Also works with custom axios instances
 * const client = axios.create({ baseURL: 'http://example.com' });
 * axiosRetry(client, { retries: 3 });
 *
 * client.get('/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * // Allows request-specific configuration
 * client
 *   .get('/test', {
 *     'axios-retry': {
 *       retries: 0
 *     }
 *   })
 *   .catch(error => { // The first request fails
 *     error !== undefined
 *   });
 *
 * @param {Axios} axios An axios instance (the axios object or one created from axios.create)
 * @param {Object} [defaultOptions]
 * @param {number} [defaultOptions.retries=3] Number of retries
 * @param {boolean} [defaultOptions.shouldResetTimeout=false]
 *        Defines if the timeout should be reset between retries
 * @param {Function} [defaultOptions.retryCondition=isNetworkOrIdempotentRequestError]
 *        A function to determine if the error can be retried
 * @param {Function} [defaultOptions.retryDelay=noDelay]
 *        A function to determine the delay between retry requests
 */
function axiosRetry(axios, defaultOptions) {
  axios.interceptors.request.use(function (config) {
    var currentState = getCurrentState(config);
    currentState.lastRequestTime = Date.now();
    return config;
  });

  axios.interceptors.response.use(null, function (error) {
    var config = error.config;

    // If we have no information to retry the request
    if (!config) {
      return Promise.reject(error);
    }

    var _getRequestOptions = getRequestOptions(config, defaultOptions),
        _getRequestOptions$re = _getRequestOptions.retries,
        retries = _getRequestOptions$re === undefined ? 3 : _getRequestOptions$re,
        _getRequestOptions$re2 = _getRequestOptions.retryCondition,
        retryCondition = _getRequestOptions$re2 === undefined ? isNetworkOrIdempotentRequestError : _getRequestOptions$re2,
        _getRequestOptions$re3 = _getRequestOptions.retryDelay,
        retryDelay = _getRequestOptions$re3 === undefined ? noDelay : _getRequestOptions$re3,
        _getRequestOptions$sh = _getRequestOptions.shouldResetTimeout,
        shouldResetTimeout = _getRequestOptions$sh === undefined ? false : _getRequestOptions$sh;

    var currentState = getCurrentState(config);

    var shouldRetry = retryCondition(error) && currentState.retryCount < retries;

    if (shouldRetry) {
      currentState.retryCount += 1;
      var delay = retryDelay(currentState.retryCount, error);

      // Axios fails merging this configuration to the default configuration because it has an issue
      // with circular structures: https://github.com/mzabriskie/axios/issues/370
      fixConfig(axios, config);

      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        var lastRequestDuration = Date.now() - currentState.lastRequestTime;
        // Minimum 1ms timeout (passing 0 or less to XHR means no timeout)
        config.timeout = Math.max(config.timeout - lastRequestDuration - delay, 1);
      }

      config.transformRequest = [function (data) {
        return data;
      }];

      return new Promise(function (resolve) {
        return setTimeout(function () {
          return resolve(axios(config));
        }, delay);
      });
    }

    return Promise.reject(error);
  });
}

// Compatibility with CommonJS
axiosRetry.isNetworkError = isNetworkError;
axiosRetry.isSafeRequestError = isSafeRequestError;
axiosRetry.isIdempotentRequestError = isIdempotentRequestError;
axiosRetry.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
axiosRetry.exponentialDelay = exponentialDelay;
axiosRetry.isRetryableError = isRetryableError;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] -> ./node_modules/axios/lib/axios.js */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/http.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/adapters/http.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 20:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var http = __webpack_require__(/*! http */ "http");
var https = __webpack_require__(/*! https */ "https");
var httpFollow = __webpack_require__(/*! follow-redirects */ "./node_modules/follow-redirects/index.js").http;
var httpsFollow = __webpack_require__(/*! follow-redirects */ "./node_modules/follow-redirects/index.js").https;
var url = __webpack_require__(/*! url */ "url");
var zlib = __webpack_require__(/*! zlib */ "zlib");
var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var isHttps = /https:?/;

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }


        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;

      // Basic proxy authorization
      if (proxy.auth) {
        var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 12:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    if (
      (utils.isBlob(requestData) || utils.isFile(requestData)) &&
      requestData.type
    ) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = unescape(encodeURIComponent(config.auth.password)) || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 50:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 19:0-14 */
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 57:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 94:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 52:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 12:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 98:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/http.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 22:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 10:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 27:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 328:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/*! default exports */
/*! export _from [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _id [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _inBundle [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _integrity [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _location [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _phantomChildren [provided] [no usage info] [missing usage info prevents renaming] */
/*!   exports [not provided] [no usage info] */
/*! export _requested [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export escapedName [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export fetchSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export raw [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export rawSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export registry [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export saveSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _requiredBy [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 1 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _resolved [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _shasum [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _spec [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _where [provided] [no usage info] [missing usage info prevents renaming] */
/*! export author [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export browser [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export ./lib/adapters/http.js [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bugs [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bundleDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*! export bundlesize [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!     export path [provided] [no usage info] [missing usage info prevents renaming] */
/*!     export threshold [provided] [no usage info] [missing usage info prevents renaming] */
/*!     other exports [not provided] [no usage info] */
/*!   other exports [not provided] [no usage info] */
/*! export dependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export follow-redirects [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export deprecated [provided] [no usage info] [missing usage info prevents renaming] */
/*! export description [provided] [no usage info] [missing usage info prevents renaming] */
/*! export devDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export bundlesize [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export coveralls [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export es6-promise [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-banner [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-cli [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-contrib-clean [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-contrib-watch [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-eslint [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-karma [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-mocha-test [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-ts [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export grunt-webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export istanbul-instrumenter-loader [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export jasmine-core [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-chrome-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-coverage [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-firefox-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-jasmine [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-jasmine-ajax [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-opera-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-safari-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sauce-launcher [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sinon [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-sourcemap-loader [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export karma-webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export load-grunt-tasks [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export minimist [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export mocha [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export sinon [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export typescript [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url-search-params [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export webpack [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export webpack-dev-server [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export homepage [provided] [no usage info] [missing usage info prevents renaming] */
/*! export jsdelivr [provided] [no usage info] [missing usage info prevents renaming] */
/*! export keywords [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 1 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 2 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 3 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 4 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export license [provided] [no usage info] [missing usage info prevents renaming] */
/*! export main [provided] [no usage info] [missing usage info prevents renaming] */
/*! export name [provided] [no usage info] [missing usage info prevents renaming] */
/*! export repository [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export scripts [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export build [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export coveralls [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export examples [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export fix [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export postversion [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export preversion [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export start [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export test [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export version [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export typings [provided] [no usage info] [missing usage info prevents renaming] */
/*! export unpkg [provided] [no usage info] [missing usage info prevents renaming] */
/*! export version [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"_from\":\"axios\",\"_id\":\"axios@0.20.0\",\"_inBundle\":false,\"_integrity\":\"sha512-ANA4rr2BDcmmAQLOKft2fufrtuvlqR+cXNNinUmvfeSNCOF98PZL+7M/v1zIdGo7OLjEA9J2gXJL+j4zGsl0bA==\",\"_location\":\"/axios\",\"_phantomChildren\":{},\"_requested\":{\"type\":\"tag\",\"registry\":true,\"raw\":\"axios\",\"name\":\"axios\",\"escapedName\":\"axios\",\"rawSpec\":\"\",\"saveSpec\":null,\"fetchSpec\":\"latest\"},\"_requiredBy\":[\"#USER\",\"/\"],\"_resolved\":\"https://registry.npmjs.org/axios/-/axios-0.20.0.tgz\",\"_shasum\":\"057ba30f04884694993a8cd07fa394cff11c50bd\",\"_spec\":\"axios\",\"_where\":\"/Users/tmidboeus.ibm.com/federated-monolith-services\",\"author\":{\"name\":\"Matt Zabriskie\"},\"browser\":{\"./lib/adapters/http.js\":\"./lib/adapters/xhr.js\"},\"bugs\":{\"url\":\"https://github.com/axios/axios/issues\"},\"bundleDependencies\":false,\"bundlesize\":[{\"path\":\"./dist/axios.min.js\",\"threshold\":\"5kB\"}],\"dependencies\":{\"follow-redirects\":\"^1.10.0\"},\"deprecated\":false,\"description\":\"Promise based HTTP client for the browser and node.js\",\"devDependencies\":{\"bundlesize\":\"^0.17.0\",\"coveralls\":\"^3.0.0\",\"es6-promise\":\"^4.2.4\",\"grunt\":\"^1.0.2\",\"grunt-banner\":\"^0.6.0\",\"grunt-cli\":\"^1.2.0\",\"grunt-contrib-clean\":\"^1.1.0\",\"grunt-contrib-watch\":\"^1.0.0\",\"grunt-eslint\":\"^20.1.0\",\"grunt-karma\":\"^2.0.0\",\"grunt-mocha-test\":\"^0.13.3\",\"grunt-ts\":\"^6.0.0-beta.19\",\"grunt-webpack\":\"^1.0.18\",\"istanbul-instrumenter-loader\":\"^1.0.0\",\"jasmine-core\":\"^2.4.1\",\"karma\":\"^1.3.0\",\"karma-chrome-launcher\":\"^2.2.0\",\"karma-coverage\":\"^1.1.1\",\"karma-firefox-launcher\":\"^1.1.0\",\"karma-jasmine\":\"^1.1.1\",\"karma-jasmine-ajax\":\"^0.1.13\",\"karma-opera-launcher\":\"^1.0.0\",\"karma-safari-launcher\":\"^1.0.0\",\"karma-sauce-launcher\":\"^1.2.0\",\"karma-sinon\":\"^1.0.5\",\"karma-sourcemap-loader\":\"^0.3.7\",\"karma-webpack\":\"^1.7.0\",\"load-grunt-tasks\":\"^3.5.2\",\"minimist\":\"^1.2.0\",\"mocha\":\"^5.2.0\",\"sinon\":\"^4.5.0\",\"typescript\":\"^2.8.1\",\"url-search-params\":\"^0.10.0\",\"webpack\":\"^1.13.1\",\"webpack-dev-server\":\"^1.14.1\"},\"homepage\":\"https://github.com/axios/axios\",\"jsdelivr\":\"dist/axios.min.js\",\"keywords\":[\"xhr\",\"http\",\"ajax\",\"promise\",\"node\"],\"license\":\"MIT\",\"main\":\"index.js\",\"name\":\"axios\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/axios/axios.git\"},\"scripts\":{\"build\":\"NODE_ENV=production grunt build\",\"coveralls\":\"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js\",\"examples\":\"node ./examples/server.js\",\"fix\":\"eslint --fix lib/**/*.js\",\"postversion\":\"git push && git push --tags\",\"preversion\":\"npm test\",\"start\":\"node ./sandbox/server.js\",\"test\":\"grunt test && bundlesize\",\"version\":\"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json\"},\"typings\":\"./index.d.ts\",\"unpkg\":\"dist/axios.min.js\",\"version\":\"0.20.0\"}");

/***/ }),

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_exports__, module, __webpack_require__ */
/*! CommonJS bailout: exports is used directly at 7:0-7 */
/*! CommonJS bailout: exports.humanize(...) prevents optimization as exports is passed as call context as 86:12-28 */
/*! CommonJS bailout: exports.enable(...) prevents optimization as exports is passed as call context as 168:0-14 */
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ "./node_modules/debug/src/debug.js":
/*!*****************************************!*\
  !*** ./node_modules/debug/src/debug.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_exports__, module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 9:10-24 */
/*! CommonJS bailout: exports is used directly at 9:0-7 */
/*! CommonJS bailout: exports.coerce(...) prevents optimization as exports is passed as call context as 85:14-28 */
/*! CommonJS bailout: exports.enabled(...) prevents optimization as exports is passed as call context as 118:18-33 */
/*! CommonJS bailout: exports.useColors(...) prevents optimization as exports is passed as call context as 119:20-37 */
/*! CommonJS bailout: exports.init(...) prevents optimization as exports is passed as call context as 124:4-16 */
/*! CommonJS bailout: exports.save(...) prevents optimization as exports is passed as call context as 139:2-14 */
/*! CommonJS bailout: exports.enable(...) prevents optimization as exports is passed as call context as 165:2-16 */
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/debug/src/index.js":
/*!*****************************************!*\
  !*** ./node_modules/debug/src/index.js ***!
  \*****************************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "./node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "./node_modules/debug/src/node.js");
}


/***/ }),

/***/ "./node_modules/debug/src/node.js":
/*!****************************************!*\
  !*** ./node_modules/debug/src/node.js ***!
  \****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_exports__, module, __webpack_require__ */
/*! CommonJS bailout: exports is used directly at 14:0-7 */
/*! CommonJS bailout: exports.humanize(...) prevents optimization as exports is passed as call context as 117:38-54 */
/*! CommonJS bailout: exports.enable(...) prevents optimization as exports is passed as call context as 248:0-14 */
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ "./node_modules/follow-redirects/debug.js":
/*!************************************************!*\
  !*** ./node_modules/follow-redirects/debug.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var debug;
try {
  /* eslint global-require: off */
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/index.js")("follow-redirects");
}
catch (error) {
  debug = function () { /* */ };
}
module.exports = debug;


/***/ }),

/***/ "./node_modules/follow-redirects/index.js":
/*!************************************************!*\
  !*** ./node_modules/follow-redirects/index.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 497:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var url = __webpack_require__(/*! url */ "url");
var URL = url.URL;
var http = __webpack_require__(/*! http */ "http");
var https = __webpack_require__(/*! https */ "https");
var Writable = __webpack_require__(/*! stream */ "stream").Writable;
var assert = __webpack_require__(/*! assert */ "assert");
var debug = __webpack_require__(/*! ./debug */ "./node_modules/follow-redirects/debug.js");

// Create handlers that pass events from native requests
var eventHandlers = Object.create(null);
["abort", "aborted", "connect", "error", "socket", "timeout"].forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  ""
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  if (callback) {
    this.once("timeout", callback);
  }

  if (this.socket) {
    startTimer(this, msecs);
  }
  else {
    var self = this;
    this._currentRequest.once("socket", function () {
      startTimer(self, msecs);
    });
  }

  this.once("response", clearTimer);
  this.once("error", clearTimer);

  return this;
};

function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(function () {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
}

// Proxy all other public ClientRequest methods
[
  "abort", "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url.format(this._options);

  // Set up event handlers
  request._redirectable = this;
  for (var event in eventHandlers) {
    /* istanbul ignore else */
    if (event) {
      request.on(event, eventHandlers[event]);
    }
  }

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.
  var location = response.headers.location;
  if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
    // Abort the current request
    this._currentRequest.removeAllListeners();
    this._currentRequest.on("error", noop);
    this._currentRequest.abort();
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
      url.parse(this._currentUrl).hostname;

    // Create the redirected request
    var redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop the Authorization header if redirecting to another host
    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      var error = new RedirectionError("Redirected request failed: " + cause.message);
      error.cause = cause;
      this.emit("error", error);
    }
  }
  else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    wrappedProtocol.request = function (input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    };

    // Executes a GET request, following redirects
    wrappedProtocol.get = function (input, options, callback) {
      var request = wrappedProtocol.request(input, options, callback);
      request.end();
      return request;
    };
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 10:0-14 */
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/is-retry-allowed/index.js":
/*!************************************************!*\
  !*** ./node_modules/is-retry-allowed/index.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 48:0-14 */
/***/ ((module) => {

"use strict";


var WHITELIST = [
	'ETIMEDOUT',
	'ECONNRESET',
	'EADDRINUSE',
	'ESOCKETTIMEDOUT',
	'ECONNREFUSED',
	'EPIPE',
	'EHOSTUNREACH',
	'EAI_AGAIN'
];

var BLACKLIST = [
	'ENOTFOUND',
	'ENETUNREACH',

	// SSL errors from https://github.com/nodejs/node/blob/ed3d8b13ee9a705d89f9e0397d9e96519e7e47ac/src/node_crypto.cc#L1950
	'UNABLE_TO_GET_ISSUER_CERT',
	'UNABLE_TO_GET_CRL',
	'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
	'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
	'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
	'CERT_SIGNATURE_FAILURE',
	'CRL_SIGNATURE_FAILURE',
	'CERT_NOT_YET_VALID',
	'CERT_HAS_EXPIRED',
	'CRL_NOT_YET_VALID',
	'CRL_HAS_EXPIRED',
	'ERROR_IN_CERT_NOT_BEFORE_FIELD',
	'ERROR_IN_CERT_NOT_AFTER_FIELD',
	'ERROR_IN_CRL_LAST_UPDATE_FIELD',
	'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
	'OUT_OF_MEM',
	'DEPTH_ZERO_SELF_SIGNED_CERT',
	'SELF_SIGNED_CERT_IN_CHAIN',
	'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
	'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
	'CERT_CHAIN_TOO_LONG',
	'CERT_REVOKED',
	'INVALID_CA',
	'PATH_LENGTH_EXCEEDED',
	'INVALID_PURPOSE',
	'CERT_UNTRUSTED',
	'CERT_REJECTED'
];

module.exports = function (err) {
	if (!err || !err.code) {
		return true;
	}

	if (WHITELIST.indexOf(err.code) !== -1) {
		return true;
	}

	if (BLACKLIST.indexOf(err.code) !== -1) {
		return false;
	}

	return true;
};


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 25:0-14 */
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "./node_modules/promise/index.js":
/*!***************************************!*\
  !*** ./node_modules/promise/index.js ***!
  \***************************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] -> ./node_modules/promise/lib/index.js */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(/*! ./lib */ "./node_modules/promise/lib/index.js")


/***/ }),

/***/ "./node_modules/promise/lib/core.js":
/*!******************************************!*\
  !*** ./node_modules/promise/lib/core.js ***!
  \******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 52:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var asap = __webpack_require__(/*! asap/raw */ "./node_modules/asap/raw.js");

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._U = 0;
  this._V = 0;
  this._W = null;
  this._X = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._Y = null;
Promise._Z = null;
Promise._0 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}
function handle(self, deferred) {
  while (self._V === 3) {
    self = self._W;
  }
  if (Promise._Y) {
    Promise._Y(self);
  }
  if (self._V === 0) {
    if (self._U === 0) {
      self._U = 1;
      self._X = deferred;
      return;
    }
    if (self._U === 1) {
      self._U = 2;
      self._X = [self._X, deferred];
      return;
    }
    self._X.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._V === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._V === 1) {
        resolve(deferred.promise, self._W);
      } else {
        reject(deferred.promise, self._W);
      }
      return;
    }
    var ret = tryCallOne(cb, self._W);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._V = 3;
      self._W = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._V = 1;
  self._W = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._V = 2;
  self._W = newValue;
  if (Promise._Z) {
    Promise._Z(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._U === 1) {
    handle(self, self._X);
    self._X = null;
  }
  if (self._U === 2) {
    for (var i = 0; i < self._X.length; i++) {
      handle(self, self._X[i]);
    }
    self._X = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}


/***/ }),

/***/ "./node_modules/promise/lib/done.js":
/*!******************************************!*\
  !*** ./node_modules/promise/lib/done.js ***!
  \******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Promise = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};


/***/ }),

/***/ "./node_modules/promise/lib/es6-extensions.js":
/*!****************************************************!*\
  !*** ./node_modules/promise/lib/es6-extensions.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 7:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._0);
  p._V = 1;
  p._W = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

var iterableToArray = function (iterable) {
  if (typeof Array.from === 'function') {
    // ES2015+, iterables exist
    iterableToArray = Array.from;
    return Array.from(iterable);
  }

  // ES5, only arrays and array-likes exist
  iterableToArray = function (x) { return Array.prototype.slice.call(x); };
  return Array.prototype.slice.call(iterable);
}

Promise.all = function (arr) {
  var args = iterableToArray(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._V === 3) {
            val = val._W;
          }
          if (val._V === 1) return res(i, val._W);
          if (val._V === 2) reject(val._W);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    iterableToArray(values).forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};


/***/ }),

/***/ "./node_modules/promise/lib/finally.js":
/*!*********************************************!*\
  !*** ./node_modules/promise/lib/finally.js ***!
  \*********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Promise = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");

module.exports = Promise;
Promise.prototype.finally = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};


/***/ }),

/***/ "./node_modules/promise/lib/index.js":
/*!*******************************************!*\
  !*** ./node_modules/promise/lib/index.js ***!
  \*******************************************/
/*! dynamic exports */
/*! export __esModule [maybe provided (runtime-defined)] [no usage info] [provision prevents renaming (no use info)] -> ./node_modules/promise/lib/core.js .__esModule */
/*! other exports [maybe provided (runtime-defined)] [no usage info] -> ./node_modules/promise/lib/core.js */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");
__webpack_require__(/*! ./done.js */ "./node_modules/promise/lib/done.js");
__webpack_require__(/*! ./finally.js */ "./node_modules/promise/lib/finally.js");
__webpack_require__(/*! ./es6-extensions.js */ "./node_modules/promise/lib/es6-extensions.js");
__webpack_require__(/*! ./node-extensions.js */ "./node_modules/promise/lib/node-extensions.js");
__webpack_require__(/*! ./synchronous.js */ "./node_modules/promise/lib/synchronous.js");


/***/ }),

/***/ "./node_modules/promise/lib/node-extensions.js":
/*!*****************************************************!*\
  !*** ./node_modules/promise/lib/node-extensions.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");
var asap = __webpack_require__(/*! asap */ "./node_modules/asap/asap.js");

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
};

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
};

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
};


/***/ }),

/***/ "./node_modules/promise/lib/synchronous.js":
/*!*************************************************!*\
  !*** ./node_modules/promise/lib/synchronous.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Promise = __webpack_require__(/*! ./core.js */ "./node_modules/promise/lib/core.js");

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._V === 3) {
      return this._W.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._W;
  };

  Promise.prototype.getReason = function () {
    if (this._V === 3) {
      return this._W.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._W;
  };

  Promise.prototype.getState = function () {
    if (this._V === 3) {
      return this._W.getState();
    }
    if (this._V === -1 || this._V === -2) {
      return 0;
    }

    return this._V;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};


/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/index.js":
/*!************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/index.js ***!
  \************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
	core: {
		Batch: __webpack_require__(/*! ./src/Batch */ "./node_modules/smartystreets-javascript-sdk/src/Batch.js"),
		ClientBuilder: __webpack_require__(/*! ./src/ClientBuilder */ "./node_modules/smartystreets-javascript-sdk/src/ClientBuilder.js"),
		buildClient: __webpack_require__(/*! ./src/util/buildClients */ "./node_modules/smartystreets-javascript-sdk/src/util/buildClients.js"),
		SharedCredentials: __webpack_require__(/*! ./src/SharedCredentials */ "./node_modules/smartystreets-javascript-sdk/src/SharedCredentials.js"),
		StaticCredentials: __webpack_require__(/*! ./src/StaticCredentials */ "./node_modules/smartystreets-javascript-sdk/src/StaticCredentials.js"),
		Errors: __webpack_require__(/*! ./src/Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js"),
	},
	usStreet: {
		Lookup: __webpack_require__(/*! ./src/us_street/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Lookup.js"),
		Candidate: __webpack_require__(/*! ./src/us_street/Candidate */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Candidate.js")
	},
	usZipcode: {
		Lookup: __webpack_require__(/*! ./src/us_zipcode/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Lookup.js"),
		Result: __webpack_require__(/*! ./src/us_zipcode/Result */ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Result.js")
	},
	usAutocomplete: {
		Lookup: __webpack_require__(/*! ./src/us_autocomplete/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Lookup.js"),
		Suggestion: __webpack_require__(/*! ./src/us_autocomplete/Suggestion */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Suggestion.js")
	},
	usAutocompletePro: {
		Lookup: __webpack_require__(/*! ./src/us_autocomplete_pro/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Lookup.js"),
		Suggestion: __webpack_require__(/*! ./src/us_autocomplete_pro/Suggestion */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Suggestion.js")
	},
	usExtract: {
		Lookup: __webpack_require__(/*! ./src/us_extract/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Lookup.js"),
		Result: __webpack_require__(/*! ./src/us_extract/Result */ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Result.js")
	},
	internationalStreet: {
		Lookup: __webpack_require__(/*! ./src/international_street/Lookup */ "./node_modules/smartystreets-javascript-sdk/src/international_street/Lookup.js"),
		Candidate: __webpack_require__(/*! ./src/international_street/Candidate */ "./node_modules/smartystreets-javascript-sdk/src/international_street/Candidate.js")
	},
};

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/package.json":
/*!****************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/package.json ***!
  \****************************************************************/
/*! default exports */
/*! export _from [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _id [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _inBundle [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _integrity [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _location [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _phantomChildren [provided] [no usage info] [missing usage info prevents renaming] */
/*!   exports [not provided] [no usage info] */
/*! export _requested [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export escapedName [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export fetchSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export raw [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export rawSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export registry [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export saveSpec [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _requiredBy [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 1 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export _resolved [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _shasum [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _spec [provided] [no usage info] [missing usage info prevents renaming] */
/*! export _where [provided] [no usage info] [missing usage info prevents renaming] */
/*! export author [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export email [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export name [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bugs [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export bundleDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*! export dependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export axios-proxy-fix [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export axios-retry [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export promise [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export deprecated [provided] [no usage info] [missing usage info prevents renaming] */
/*! export description [provided] [no usage info] [missing usage info prevents renaming] */
/*! export devDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export aws-sdk [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export babel-core [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export babel-preset-env [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export babelify [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export browserify [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export chai [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export chai-as-promised [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export mocha [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export s3-upload-stream [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export tinyify [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export zlib [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export homepage [provided] [no usage info] [missing usage info prevents renaming] */
/*! export keywords [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 0 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 1 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 10 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 11 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 12 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 13 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 14 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 15 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 2 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 3 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 4 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 5 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 6 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 7 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 8 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export 9 [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export license [provided] [no usage info] [missing usage info prevents renaming] */
/*! export main [provided] [no usage info] [missing usage info prevents renaming] */
/*! export name [provided] [no usage info] [missing usage info prevents renaming] */
/*! export repository [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export type [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export url [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export scripts [provided] [no usage info] [missing usage info prevents renaming] */
/*!   export test [provided] [no usage info] [missing usage info prevents renaming] */
/*!   other exports [not provided] [no usage info] */
/*! export version [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"_from\":\"smartystreets-javascript-sdk\",\"_id\":\"smartystreets-javascript-sdk@1.6.0\",\"_inBundle\":false,\"_integrity\":\"sha512-mNuduv9D4YjnxqG1NPobFTM8sHkn6nBpqusqpnUF2bQHsuqulXpp1FJiMdX7xlXNKv15niEaOakO7ajm5lgMIQ==\",\"_location\":\"/smartystreets-javascript-sdk\",\"_phantomChildren\":{},\"_requested\":{\"type\":\"tag\",\"registry\":true,\"raw\":\"smartystreets-javascript-sdk\",\"name\":\"smartystreets-javascript-sdk\",\"escapedName\":\"smartystreets-javascript-sdk\",\"rawSpec\":\"\",\"saveSpec\":null,\"fetchSpec\":\"latest\"},\"_requiredBy\":[\"#USER\",\"/\"],\"_resolved\":\"https://registry.npmjs.org/smartystreets-javascript-sdk/-/smartystreets-javascript-sdk-1.6.0.tgz\",\"_shasum\":\"c3ff00f32747e93ab28dc20279f5a9c770fd462c\",\"_spec\":\"smartystreets-javascript-sdk\",\"_where\":\"/Users/tmidboeus.ibm.com/federated-monolith-services\",\"author\":{\"name\":\"SmartyStreets SDK Team\",\"email\":\"support@smartystreets.com\",\"url\":\"https://www.smartystreets.com\"},\"bugs\":{\"url\":\"https://github.com/smartystreets/smartystreets-javascript-sdk/issues\"},\"bundleDependencies\":false,\"dependencies\":{\"axios-proxy-fix\":\"^0.16.3\",\"axios-retry\":\"^3.0.1\",\"promise\":\"^8.0.1\"},\"deprecated\":false,\"description\":\"Quick and easy SmartyStreets address validation.\",\"devDependencies\":{\"aws-sdk\":\"^2.412.0\",\"babel-core\":\"^6.26.0\",\"babel-preset-env\":\"^1.6.1\",\"babelify\":\"^8.0.0\",\"browserify\":\"^16.2.3\",\"chai\":\"^4.1.2\",\"chai-as-promised\":\"^7.1.1\",\"mocha\":\"^8.0.1\",\"s3-upload-stream\":\"^1.0.7\",\"tinyify\":\"^2.5.2\",\"zlib\":\"^1.0.5\"},\"homepage\":\"https://github.com/smartystreets/smartystreets-javascript-sdk#readme\",\"keywords\":[\"smartystreets\",\"address\",\"validation\",\"verification\",\"verify\",\"validate\",\"street-address\",\"geocoding\",\"addresses\",\"zipcode\",\"autocomplete\",\"autosuggest\",\"suggestions\",\"international\",\"http\",\"sdk\"],\"license\":\"Apache-2.0\",\"main\":\"index.js\",\"name\":\"smartystreets-javascript-sdk\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/smartystreets/smartystreets-javascript-sdk.git\"},\"scripts\":{\"test\":\"mocha 'tests/**/*.js'\"},\"version\":\"1.6.0\"}");

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/AgentSender.js":
/*!**********************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/AgentSender.js ***!
  \**********************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 18:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

class AgentSender {
	constructor(innerSender) {
		this.sender = innerSender;
	}

	send(request) {
		request.parameters.agent = "smartystreets (sdk:javascript@" + __webpack_require__(/*! ../package.json */ "./node_modules/smartystreets-javascript-sdk/package.json").version + ")";
		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(resolve)
				.catch(reject);
		});
	}
}

module.exports = AgentSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/BaseUrlSender.js":
/*!************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/BaseUrlSender.js ***!
  \************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 20:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

class BaseUrlSender {
	constructor(innerSender, urlOverride) {
		this.urlOverride = urlOverride;
		this.sender = innerSender;
	}

	send(request) {
		return new Promise((resolve, reject) => {
			request.baseUrl = this.urlOverride;

			this.sender.send(request)
				.then(resolve)
				.catch(reject);
		});
	}
}

module.exports = BaseUrlSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/Batch.js":
/*!****************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/Batch.js ***!
  \****************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 49:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const BatchFullError = __webpack_require__(/*! ./Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").BatchFullError;

/**
 * This class contains a collection of up to 100 lookups to be sent to one of the SmartyStreets APIs<br>
 *     all at once. This is more efficient than sending them one at a time.
 */
class Batch {
	constructor () {
		this.lookups = [];
	}

	add (lookup) {
		if (this.lookupsHasRoomForLookup()) this.lookups.push(lookup);
		else throw new BatchFullError();
	}

	lookupsHasRoomForLookup() {
		const maxNumberOfLookups = 100;
		return this.lookups.length < maxNumberOfLookups;
	}

	length() {
		return this.lookups.length;
	}

	getByIndex(index) {
		return this.lookups[index];
	}

	getByInputId(inputId) {
		return this.lookups.filter(lookup => {
			return lookup.inputId === inputId;
		})[0];
	}

	/**
	 * Clears the lookups stored in the batch so it can be used again.<br>
	 *     This helps avoid the overhead of building a new Batch object for each group of lookups.
	 */
	clear () {
		this.lookups = [];
	}

	isEmpty () {
		return this.length() === 0;
	}
}

module.exports = Batch;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/ClientBuilder.js":
/*!************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/ClientBuilder.js ***!
  \************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 201:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const HttpSender = __webpack_require__(/*! ./HttpSender */ "./node_modules/smartystreets-javascript-sdk/src/HttpSender.js");
const SigningSender = __webpack_require__(/*! ./SigningSender */ "./node_modules/smartystreets-javascript-sdk/src/SigningSender.js");
const BaseUrlSender = __webpack_require__(/*! ./BaseUrlSender */ "./node_modules/smartystreets-javascript-sdk/src/BaseUrlSender.js");
const AgentSender = __webpack_require__(/*! ./AgentSender */ "./node_modules/smartystreets-javascript-sdk/src/AgentSender.js");
const StaticCredentials = __webpack_require__(/*! ./StaticCredentials */ "./node_modules/smartystreets-javascript-sdk/src/StaticCredentials.js");
const SharedCredentials = __webpack_require__(/*! ./SharedCredentials */ "./node_modules/smartystreets-javascript-sdk/src/SharedCredentials.js");
const CustomHeaderSender = __webpack_require__(/*! ./CustomHeaderSender */ "./node_modules/smartystreets-javascript-sdk/src/CustomHeaderSender.js");
const StatusCodeSender = __webpack_require__(/*! ./StatusCodeSender */ "./node_modules/smartystreets-javascript-sdk/src/StatusCodeSender.js");
const LicenseSender = __webpack_require__(/*! ./LicenseSender */ "./node_modules/smartystreets-javascript-sdk/src/LicenseSender.js");
const BadCredentialsError = __webpack_require__(/*! ./Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").BadCredentialsError;

//TODO: refactor this to work more cleanly with a bundler.
const UsStreetClient = __webpack_require__(/*! ./us_street/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Client.js");
const UsZipcodeClient = __webpack_require__(/*! ./us_zipcode/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Client.js");
const UsAutocompleteClient = __webpack_require__(/*! ./us_autocomplete/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Client.js");
const UsAutocompleteProClient = __webpack_require__(/*! ./us_autocomplete_pro/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Client.js");
const UsExtractClient = __webpack_require__(/*! ./us_extract/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Client.js");
const InternationalStreetClient = __webpack_require__(/*! ./international_street/Client */ "./node_modules/smartystreets-javascript-sdk/src/international_street/Client.js");
const UsReverseGeoClient = __webpack_require__(/*! ./us_reverse_geo/Client */ "./node_modules/smartystreets-javascript-sdk/src/us_reverse_geo/Client.js");

const INTERNATIONAL_STREET_API_URI = "https://international-street.api.smartystreets.com/verify";
const US_AUTOCOMPLETE_API_URL = "https://us-autocomplete.api.smartystreets.com/suggest";
const US_AUTOCOMPLETE_PRO_API_URL = "https://us-autocomplete-pro.api.smartystreets.com/lookup";
const US_EXTRACT_API_URL = "https://us-extract.api.smartystreets.com/";
const US_STREET_API_URL = "https://us-street.api.smartystreets.com/street-address";
const US_ZIP_CODE_API_URL = "https://us-zipcode.api.smartystreets.com/lookup";
const US_REVERSE_GEO_API_URL = "https://us-reverse-geo.api.smartystreets.com/lookup";

/**
 * The ClientBuilder class helps you build a client object for one of the supported SmartyStreets APIs.<br>
 * You can use ClientBuilder's methods to customize settings like maximum retries or timeout duration. These methods<br>
 * are chainable, so you can usually get set up with one line of code.
 */
class ClientBuilder {
	constructor(signer) {
		if (noCredentialsProvided()) throw new BadCredentialsError();

		this.signer = signer;
		this.httpSender = undefined;
		this.maxRetries = 5;
		this.maxTimeout = 10000;
		this.baseUrl = undefined;
		this.proxy = undefined;
		this.customHeaders = {};
		this.debug = undefined;
		this.licenses = [];

		function noCredentialsProvided() {
			return !signer instanceof StaticCredentials || !signer instanceof SharedCredentials;
		}
	}

	/**
	 * @param retries The maximum number of times to retry sending the request to the API. (Default is 5)
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withMaxRetries(retries) {
		this.maxRetries = retries;
		return this;
	}

	/**
	 * @param timeout The maximum time (in milliseconds) to wait for a connection, and also to wait for <br>
	 *                   the response to be read. (Default is 10000)
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withMaxTimeout(timeout) {
		this.maxTimeout = timeout;
		return this;
	}

	/**
	 * @param sender Default is a series of nested senders. See <b>buildSender()</b>.
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withSender(sender) {
		this.httpSender = sender;
		return this;
	}

	/**
	 * This may be useful when using a local installation of the SmartyStreets APIs.
	 * @param url Defaults to the URL for the API corresponding to the <b>Client</b> object being built.
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withBaseUrl(url) {
		this.baseUrl = url;
		return this;
	}

	/**
	 * Use this to specify a proxy through which to send all lookups.
	 * @param host The host of the proxy server (do not include the port).
	 * @param port The port on the proxy server to which you wish to connect.
	 * @param username The username to login to the proxy.
	 * @param password The password to login to the proxy.
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withProxy(host, port, username, password) {
		this.proxy = {
			host: host,
			port: port
		};

		if (username && password) {
			this.proxy.auth = {
				username: username,
				password: password
			};
		}

		return this;
	}

	/**
	 * Use this to add any additional headers you need.
	 * @param customHeaders A String to Object <b>Map</b> of header name/value pairs.
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withCustomHeaders(customHeaders) {
		this.customHeaders = customHeaders;

		return this;
	}

	/**
	 * Enables debug mode, which will print information about the HTTP request and response to console.log
	 * @return Returns <b>this</b> to accommodate method chaining.
	 */
	withDebug() {
		this.debug = true;

		return this;
	}

	/**
	 * Allows the caller to specify the subscription license (aka "track") they wish to use.
	 * @param licenses A String Array of licenses.
	 * @returns Returns <b>this</b> to accommodate method chaining.
	 */
	withLicenses(licenses) {
		for (const license in licenses) {
			this.licenses.push(license);
		}

		return this;
	}


	buildSender() {
		if (this.httpSender) return this.httpSender;

		const httpSender = new HttpSender(this.maxTimeout, this.maxRetries, this.proxy, this.debug);
		const statusCodeSender = new StatusCodeSender(httpSender);
		const signingSender = new SigningSender(statusCodeSender, this.signer);
		const agentSender = new AgentSender(signingSender);
		const customHeaderSender = new CustomHeaderSender(agentSender, this.customHeaders);
		const baseUrlSender = new BaseUrlSender(customHeaderSender, this.baseUrl);
		const licenseSender = new LicenseSender(baseUrlSender, this.licenses);

		return licenseSender;
	}

	buildClient(baseUrl, Client) {
		if (!this.baseUrl) {
			this.baseUrl = baseUrl;
		}

		return new Client(this.buildSender());
	}

	buildUsStreetApiClient() {
		return this.buildClient(US_STREET_API_URL, UsStreetClient);
	}

	buildUsZipcodeClient() {
		return this.buildClient(US_ZIP_CODE_API_URL, UsZipcodeClient);
	}

	buildUsAutocompleteClient() {
		return this.buildClient(US_AUTOCOMPLETE_API_URL, UsAutocompleteClient);
	}

	buildUsAutocompleteProClient() {
		return this.buildClient(US_AUTOCOMPLETE_PRO_API_URL, UsAutocompleteProClient);
	}

	buildUsExtractClient() {
		return this.buildClient(US_EXTRACT_API_URL, UsExtractClient);
	}

	buildInternationalStreetClient() {
		return this.buildClient(INTERNATIONAL_STREET_API_URI, InternationalStreetClient);
	}

	buildUsReverseGeoClient() {
		return this.buildClient(US_REVERSE_GEO_API_URL, UsReverseGeoClient);
	}
}

module.exports = ClientBuilder;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/CustomHeaderSender.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/CustomHeaderSender.js ***!
  \*****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 22:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

class CustomHeaderSender {
	constructor(innerSender, customHeaders) {
		this.sender = innerSender;
		this.customHeaders = customHeaders;
	}

	send(request) {
		for (let key in this.customHeaders) {
			request.headers[key] = this.customHeaders[key];
		}

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(resolve)
				.catch(reject);
		});
	}
}

module.exports = CustomHeaderSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/Errors.js":
/*!*****************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/Errors.js ***!
  \*****************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 79:0-14 */
/***/ ((module) => {

class SmartyError extends Error {
	constructor(message) {
		super(message);
	}
}

class BatchFullError extends SmartyError {
	constructor() {
		super("A batch can contain a max of 100 lookups.");
	}
}

class BatchEmptyError extends SmartyError {
	constructor() {
		super("A batch must contain at least 1 lookup.");
	}
}

class UndefinedLookupError extends SmartyError {
	constructor() {
		super("The lookup provided is missing or undefined. Make sure you're passing a Lookup object.");
	}
}

class BadCredentialsError extends SmartyError {
	constructor() {
		super("Unauthorized: The credentials were provided incorrectly or did not match any existing active credentials.");
	}
}

class PaymentRequiredError extends SmartyError {
	constructor() {
		super("Payment Required: There is no active subscription for the account associated with the credentials submitted with the request.");
	}
}

class RequestEntityTooLargeError extends SmartyError {
	constructor() {
		super("Request Entity Too Large: The request body has exceeded the maximum size.");
	}
}

class BadRequestError extends SmartyError {
	constructor() {
		super("Bad Request (Malformed Payload): A GET request lacked a street field or the request body of a POST request contained malformed JSON.");
	}
}

class UnprocessableEntityError extends SmartyError {
	constructor(message) {
		super(message);
	}
}

class TooManyRequestsError extends SmartyError {
	constructor() {
		super("When using the public 'website key' authentication, we restrict the number of requests coming from a given source over too short of a time.");
	}
}

class InternalServerError extends SmartyError {
	constructor() {
		super("Internal Server Error.");
	}
}

class ServiceUnavailableError extends SmartyError {
	constructor() {
		super("Service Unavailable. Try again later.");
	}
}

class GatewayTimeoutError extends SmartyError {
	constructor() {
		super("The upstream data provider did not respond in a timely fashion and the request failed. A serious, yet rare occurrence indeed.");
	}
}

module.exports = {
	BatchFullError: BatchFullError,
	BatchEmptyError: BatchEmptyError,
	UndefinedLookupError: UndefinedLookupError,
	BadCredentialsError: BadCredentialsError,
	PaymentRequiredError: PaymentRequiredError,
	RequestEntityTooLargeError: RequestEntityTooLargeError,
	BadRequestError: BadRequestError,
	UnprocessableEntityError: UnprocessableEntityError,
	TooManyRequestsError: TooManyRequestsError,
	InternalServerError: InternalServerError,
	ServiceUnavailableError: ServiceUnavailableError,
	GatewayTimeoutError: GatewayTimeoutError
};

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/HttpSender.js":
/*!*********************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/HttpSender.js ***!
  \*********************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 75:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Response = __webpack_require__(/*! ./Response */ "./node_modules/smartystreets-javascript-sdk/src/Response.js");
const Axios = __webpack_require__(/*! axios-proxy-fix */ "./node_modules/axios-proxy-fix/index.js");
const axiosRetry = __webpack_require__(/*! axios-retry */ "./node_modules/axios-retry/index.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

class HttpSender {
	constructor(timeout = 10000, retries = 5, proxyConfig, debug = false) {
		axiosRetry(Axios, {
			retries: retries,
		});
		this.timeout = timeout;
		this.proxyConfig = proxyConfig;
		if (debug) this.enableDebug();
	}

	buildRequestConfig({payload, parameters, headers, baseUrl}) {
		let config = {
			method: "GET",
			timeout: this.timeout,
			params: parameters,
			headers: headers,
			baseURL: baseUrl,
			validateStatus: function (status) {
				return status < 500;
			},
		};

		if (payload) {
			config.method = "POST";
			config.data = payload;
		}

		if (this.proxyConfig) config.proxy = this.proxyConfig;
		return config;
	}

	buildSmartyResponse(response, error) {
		if (response) return new Response(response.status, response.data);
		return new Response(undefined, undefined, error)
	}

	send(request) {
		return new Promise((resolve, reject) => {
			let requestConfig = this.buildRequestConfig(request);

			Axios(requestConfig)
				.then(response => {
					let smartyResponse = this.buildSmartyResponse(response);

					if (smartyResponse.statusCode >= 400) reject(smartyResponse);

					resolve(smartyResponse);
				})
				.catch(error => reject(this.buildSmartyResponse(undefined, error)));
		});
	}

	enableDebug() {
		Axios.interceptors.request.use(request => {
			console.log('Request:\r\n', request);
			console.log('\r\n*******************************************\r\n');
			return request
		});

		Axios.interceptors.response.use(response => {
			console.log('Response:\r\n');
			console.log('Status:', response.status, response.statusText);
			console.log('Headers:', response.headers);
			console.log('Data:', response.data);
			return response
		})
	}
}

module.exports = HttpSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/InputData.js":
/*!********************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/InputData.js ***!
  \********************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 16:0-14 */
/***/ ((module) => {

class InputData {
	constructor(lookup) {
		this.lookup = lookup;
		this.data = {};
	}

	add(apiField, lookupField) {
		if (this.lookupFieldIsPopulated(lookupField)) this.data[apiField] = this.lookup[lookupField];
	}

	lookupFieldIsPopulated(lookupField) {
		return this.lookup[lookupField] !== "" && this.lookup[lookupField] !== undefined;
	}
}

module.exports = InputData;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/LicenseSender.js":
/*!************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/LicenseSender.js ***!
  \************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 22:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

class LicenseSender {
	constructor(innerSender, licenses) {
		this.sender = innerSender;
		this.licenses = licenses;
	}

	send(request) {
		if (this.licenses.length !== 0) {
			request.parameters["license"] = this.licenses.join(",");
		}

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(resolve)
				.catch(reject);
		});
	}
}

module.exports = LicenseSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/Request.js":
/*!******************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/Request.js ***!
  \******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

class Request {
	constructor(payload) {
		this.baseUrl = "";
		this.payload = payload;
		this.headers = {
			"Content-Type": "application/json; charset=utf-8",
		};

		this.parameters = {};
	}
}

module.exports = Request;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/Response.js":
/*!*******************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/Response.js ***!
  \*******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module) => {

class Response {
	constructor (statusCode, payload, error = undefined) {
		this.statusCode = statusCode;
		this.payload = payload;
		this.error = error;
	}
}

module.exports = Response;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/SharedCredentials.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/SharedCredentials.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

class SharedCredentials {
	constructor(authId, hostName) {
		this.authId = authId;
		this.hostName = hostName;
	}

	sign(request) {
		request.parameters["auth-id"] = this.authId;
		if (this.hostName) request.headers["Referer"] = this.hostName;
	}
}

module.exports = SharedCredentials;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/SigningSender.js":
/*!************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/SigningSender.js ***!
  \************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 27:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");
const UnprocessableEntityError = __webpack_require__(/*! ./Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").UnprocessableEntityError;
const SharedCredentials = __webpack_require__(/*! ./SharedCredentials */ "./node_modules/smartystreets-javascript-sdk/src/SharedCredentials.js");

class SigningSender {
	constructor(innerSender, signer) {
		this.signer = signer;
		this.sender = innerSender;
	}

	send(request) {
		const sendingPostWithSharedCredentials = request.payload && this.signer instanceof SharedCredentials;
		if (sendingPostWithSharedCredentials) {
			const message = "Shared credentials cannot be used in batches with a length greater than 1 or when using the US Extract API.";
			throw new UnprocessableEntityError(message);
		}

		return new Promise((resolve, reject) => {
			this.signer.sign(request);
			this.sender.send(request)
				.then(resolve)
				.catch(reject);
		});
	}
}

module.exports = SigningSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/StaticCredentials.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/StaticCredentials.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

class StaticCredentials {
	constructor (authId, authToken) {
		this.authId = authId;
		this.authToken = authToken;
	}

	sign (request) {
		request.parameters["auth-id"] = this.authId;
		request.parameters["auth-token"] = this.authToken;
	}
}

module.exports = StaticCredentials;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/StatusCodeSender.js":
/*!***************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/StatusCodeSender.js ***!
  \***************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 58:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");
const Errors = __webpack_require__(/*! ./Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");

class StatusCodeSender {
	constructor(innerSender) {
		this.sender = innerSender;
	}

	send(request) {
		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(resolve)
				.catch(error => {
					switch (error.statusCode) {
						case 400:
							error.error = new Errors.BadRequestError();
							break;

						case 401:
							error.error = new Errors.BadCredentialsError();
							break;

						case 402:
							error.error = new Errors.PaymentRequiredError();
							break;

						case 413:
							error.error = new Errors.RequestEntityTooLargeError();
							break;

						case 422:
							error.error = new Errors.UnprocessableEntityError("GET request lacked required fields.");
							break;

						case 429:
							error.error = new Errors.TooManyRequestsError();
							break;

						case 500:
							error.error = new Errors.InternalServerError();
							break;

						case 503:
							error.error = new Errors.ServiceUnavailableError();
							break;

						case 504:
							error.error = new Errors.GatewayTimeoutError();
							break;
					}

					reject(error);
				});
		});
	}
}

module.exports = StatusCodeSender;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/international_street/Candidate.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/international_street/Candidate.js ***!
  \*****************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 145:0-14 */
/***/ ((module) => {

/**
 * A candidate is a possible match for an address that was submitted.<br>
 *     A lookup can have multiple candidates if the address was ambiguous.
 *
 * @see "https://smartystreets.com/docs/cloud/international-street-api#root"
 */
class Candidate {
	constructor(responseData) {
		this.organization = responseData.organization;
		this.address1 = responseData.address1;
		this.address2 = responseData.address2;
		this.address3 = responseData.address3;
		this.address4 = responseData.address4;
		this.address5 = responseData.address5;
		this.address6 = responseData.address6;
		this.address7 = responseData.address7;
		this.address8 = responseData.address8;
		this.address9 = responseData.address9;
		this.address10 = responseData.address10;
		this.address11 = responseData.address11;
		this.address12 = responseData.address12;

		this.components = {};
		if (responseData.components !== undefined) {
			this.components.countryIso3 = responseData.components.country_iso_3;
			this.components.superAdministrativeArea = responseData.components.super_administrative_area;
			this.components.administrativeArea = responseData.components.administrative_area;
			this.components.subAdministrativeArea = responseData.components.sub_administrative_area;
			this.components.dependentLocality = responseData.components.dependent_locality;
			this.components.dependentLocalityName = responseData.components.dependent_locality_name;
			this.components.doubleDependentLocality = responseData.components.double_dependent_locality;
			this.components.locality = responseData.components.locality;
			this.components.postalCode = responseData.components.postal_code;
			this.components.postalCodeShort = responseData.components.postal_code_short;
			this.components.postalCodeExtra = responseData.components.postal_code_extra;
			this.components.premise = responseData.components.premise;
			this.components.premiseExtra = responseData.components.premise_extra;
			this.components.premisePrefixNumber = responseData.components.premise_prefix_number;
			this.components.premiseNumber = responseData.components.premise_number;
			this.components.premiseType = responseData.components.premise_type;
			this.components.thoroughfare = responseData.components.thoroughfare;
			this.components.thoroughfarePredirection = responseData.components.thoroughfare_predirection;
			this.components.thoroughfarePostdirection = responseData.components.thoroughfare_postdirection;
			this.components.thoroughfareName = responseData.components.thoroughfare_name;
			this.components.thoroughfareTrailingType = responseData.components.thoroughfare_trailing_type;
			this.components.thoroughfareType = responseData.components.thoroughfare_type;
			this.components.dependentThoroughfare = responseData.components.dependent_thoroughfare;
			this.components.dependentThoroughfarePredirection = responseData.components.dependent_thoroughfare_predirection;
			this.components.dependentThoroughfarePostdirection = responseData.components.dependent_thoroughfare_postdirection;
			this.components.dependentThoroughfareName = responseData.components.dependent_thoroughfare_name;
			this.components.dependentThoroughfareTrailingType = responseData.components.dependent_thoroughfare_trailing_type;
			this.components.dependentThoroughfareType = responseData.components.dependent_thoroughfare_type;
			this.components.building = responseData.components.building;
			this.components.buildingLeadingType = responseData.components.building_leading_type;
			this.components.buildingName = responseData.components.building_name;
			this.components.buildingTrailingType = responseData.components.building_trailing_type;
			this.components.subBuildingType = responseData.components.sub_building_type;
			this.components.subBuildingNumber = responseData.components.sub_building_number;
			this.components.subBuildingName = responseData.components.sub_building_name;
			this.components.subBuilding = responseData.components.sub_building;
			this.components.postBox = responseData.components.post_box;
			this.components.postBoxType = responseData.components.post_box_type;
			this.components.postBoxNumber = responseData.components.post_box_number;
		}

		this.analysis = {};
		if (responseData.analysis !== undefined) {
			this.analysis.verificationStatus = responseData.analysis.verification_status;
			this.analysis.addressPrecision = responseData.analysis.address_precision;
			this.analysis.maxAddressPrecision = responseData.analysis.max_address_precision;

			this.analysis.changes = {};
			if (responseData.analysis.changes !== undefined) {
				this.analysis.changes.organization = responseData.analysis.changes.organization;
				this.analysis.changes.address1 = responseData.analysis.changes.address1;
				this.analysis.changes.address2 = responseData.analysis.changes.address2;
				this.analysis.changes.address3 = responseData.analysis.changes.address3;
				this.analysis.changes.address4 = responseData.analysis.changes.address4;
				this.analysis.changes.address5 = responseData.analysis.changes.address5;
				this.analysis.changes.address6 = responseData.analysis.changes.address6;
				this.analysis.changes.address7 = responseData.analysis.changes.address7;
				this.analysis.changes.address8 = responseData.analysis.changes.address8;
				this.analysis.changes.address9 = responseData.analysis.changes.address9;
				this.analysis.changes.address10 = responseData.analysis.changes.address10;
				this.analysis.changes.address11 = responseData.analysis.changes.address11;
				this.analysis.changes.address12 = responseData.analysis.changes.address12;

				this.analysis.changes.components = {};
				if (responseData.analysis.changes.components !== undefined) {
					this.analysis.changes.components.countryIso3 = responseData.analysis.changes.components.country_iso_3;
					this.analysis.changes.components.superAdministrativeArea = responseData.analysis.changes.components.super_administrative_area;
					this.analysis.changes.components.administrativeArea = responseData.analysis.changes.components.administrative_area;
					this.analysis.changes.components.subAdministrativeArea = responseData.analysis.changes.components.sub_administrative_area;
					this.analysis.changes.components.dependentLocality = responseData.analysis.changes.components.dependent_locality;
					this.analysis.changes.components.dependentLocalityName = responseData.analysis.changes.components.dependent_locality_name;
					this.analysis.changes.components.doubleDependentLocality = responseData.analysis.changes.components.double_dependent_locality;
					this.analysis.changes.components.locality = responseData.analysis.changes.components.locality;
					this.analysis.changes.components.postalCode = responseData.analysis.changes.components.postal_code;
					this.analysis.changes.components.postalCodeShort = responseData.analysis.changes.components.postal_code_short;
					this.analysis.changes.components.postalCodeExtra = responseData.analysis.changes.components.postal_code_extra;
					this.analysis.changes.components.premise = responseData.analysis.changes.components.premise;
					this.analysis.changes.components.premiseExtra = responseData.analysis.changes.components.premise_extra;
					this.analysis.changes.components.premisePrefixNumber = responseData.analysis.changes.components.premise_prefix_number;
					this.analysis.changes.components.premiseNumber = responseData.analysis.changes.components.premise_number;
					this.analysis.changes.components.premiseType = responseData.analysis.changes.components.premise_type;
					this.analysis.changes.components.thoroughfare = responseData.analysis.changes.components.thoroughfare;
					this.analysis.changes.components.thoroughfarePredirection = responseData.analysis.changes.components.thoroughfare_predirection;
					this.analysis.changes.components.thoroughfarePostdirection = responseData.analysis.changes.components.thoroughfare_postdirection;
					this.analysis.changes.components.thoroughfareName = responseData.analysis.changes.components.thoroughfare_name;
					this.analysis.changes.components.thoroughfareTrailingType = responseData.analysis.changes.components.thoroughfare_trailing_type;
					this.analysis.changes.components.thoroughfareType = responseData.analysis.changes.components.thoroughfare_type;
					this.analysis.changes.components.dependentThoroughfare = responseData.analysis.changes.components.dependent_thoroughfare;
					this.analysis.changes.components.dependentThoroughfarePredirection = responseData.analysis.changes.components.dependent_thoroughfare_predirection;
					this.analysis.changes.components.dependentThoroughfarePostdirection = responseData.analysis.changes.components.dependent_thoroughfare_postdirection;
					this.analysis.changes.components.dependentThoroughfareName = responseData.analysis.changes.components.dependent_thoroughfare_name;
					this.analysis.changes.components.dependentThoroughfareTrailingType = responseData.analysis.changes.components.dependent_thoroughfare_trailing_type;
					this.analysis.changes.components.dependentThoroughfareType = responseData.analysis.changes.components.dependent_thoroughfare_type;
					this.analysis.changes.components.building = responseData.analysis.changes.components.building;
					this.analysis.changes.components.buildingLeadingType = responseData.analysis.changes.components.building_leading_type;
					this.analysis.changes.components.buildingName = responseData.analysis.changes.components.building_name;
					this.analysis.changes.components.buildingTrailingType = responseData.analysis.changes.components.building_trailing_type;
					this.analysis.changes.components.subBuildingType = responseData.analysis.changes.components.sub_building_type;
					this.analysis.changes.components.subBuildingNumber = responseData.analysis.changes.components.sub_building_number;
					this.analysis.changes.components.subBuildingName = responseData.analysis.changes.components.sub_building_name;
					this.analysis.changes.components.subBuilding = responseData.analysis.changes.components.sub_building;
					this.analysis.changes.components.postBox = responseData.analysis.changes.components.post_box;
					this.analysis.changes.components.postBoxType = responseData.analysis.changes.components.post_box_type;
					this.analysis.changes.components.postBoxNumber = responseData.analysis.changes.components.post_box_number;
				}
				//TODO: Fill in the rest of these fields and their corresponding tests.
			}
		}

		this.metadata = {};
		if (responseData.metadata !== undefined) {
			this.metadata.latitude = responseData.metadata.latitude;
			this.metadata.longitude = responseData.metadata.longitude;
			this.metadata.geocodePrecision = responseData.metadata.geocode_precision;
			this.metadata.maxGeocodePrecision = responseData.metadata.max_geocode_precision;
			this.metadata.addressFormat = responseData.metadata.address_format;
		}
	}
}

module.exports = Candidate;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/international_street/Client.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/international_street/Client.js ***!
  \**************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 43:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const Errors = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");
const Candidate = __webpack_require__(/*! ./Candidate */ "./node_modules/smartystreets-javascript-sdk/src/international_street/Candidate.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");
const buildInputData = __webpack_require__(/*! ../util/buildInputData */ "./node_modules/smartystreets-javascript-sdk/src/util/buildInputData.js");
const keyTranslationFormat = __webpack_require__(/*! ../util/apiToSDKKeyMap */ "./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js").internationalStreet;

/**
 * This client sends lookups to the SmartyStreets International Street API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	send(lookup) {
		if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

		let request = new Request();
		request.parameters = buildInputData(lookup, keyTranslationFormat);

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(response => {
					if (response.error) reject(response.error);

					resolve(attachLookupCandidates(response, lookup));
				})
				.catch(reject);
		});

		function attachLookupCandidates(response, lookup) {
			response.payload.map(rawCandidate => {
				lookup.result.push(new Candidate(rawCandidate));
			});

			return lookup;
		}
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/international_street/Lookup.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/international_street/Lookup.js ***!
  \**************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 85:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const UnprocessableEntityError = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").UnprocessableEntityError;
const messages = {
	countryRequired: "Country field is required.",
	freeformOrAddress1Required: "Either freeform or address1 is required.",
	insufficientInformation: "Insufficient information: One or more required fields were not set on the lookup.",
	badGeocode: "Invalid input: geocode can only be set to 'true' (default is 'false'.",
	invalidLanguage: "Invalid input: language can only be set to 'latin' or 'native'. When not set, the the output language will match the language of the input values."
};


/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     <p><b>Note: </b><i>Lookups must have certain required fields set with non-blank values. <br>
 *         These can be found at the URL below.</i></p>
 *     @see "https://smartystreets.com/docs/cloud/international-street-api#http-input-fields"
 */
class Lookup {
	constructor(country, freeform) {
		this.result = [];

		this.country = country;
		this.freeform = freeform;
		this.address1 = undefined;
		this.address2 = undefined;
		this.address3 = undefined;
		this.address4 = undefined;
		this.organization = undefined;
		this.locality = undefined;
		this.administrativeArea = undefined;
		this.postalCode = undefined;
		this.geocode = undefined;
		this.language = undefined;
		this.inputId = undefined;

		this.ensureEnoughInfo = this.ensureEnoughInfo.bind(this);
		this.ensureValidData = this.ensureValidData.bind(this);
	}

	ensureEnoughInfo() {
		if (fieldIsMissing(this.country)) throw new UnprocessableEntityError(messages.countryRequired);

		if (fieldIsSet(this.freeform)) return true;

		if (fieldIsMissing(this.address1)) throw new UnprocessableEntityError(messages.freeformOrAddress1Required);

		if (fieldIsSet(this.postalCode)) return true;

		if (fieldIsMissing(this.locality) || fieldIsMissing(this.administrativeArea)) throw new UnprocessableEntityError(messages.insufficientInformation);

		return true;
	}

	ensureValidData() {
		let languageIsSetIncorrectly = () => {
			let isLanguage = language => this.language.toLowerCase() === language;

			return fieldIsSet(this.language) && !(isLanguage("latin") || isLanguage("native"));
		};

		let geocodeIsSetIncorrectly = () => {
			return fieldIsSet(this.geocode) && this.geocode.toLowerCase() !== "true";
		};

		if (geocodeIsSetIncorrectly()) throw new UnprocessableEntityError(messages.badGeocode);

		if (languageIsSetIncorrectly()) throw new UnprocessableEntityError(messages.invalidLanguage);

		return true;
	}
}

function fieldIsMissing (field) {
	if (!field) return true;

	const whitespaceCharacters = /\s/g;

	return field.replace(whitespaceCharacters, "").length < 1;
}

function fieldIsSet (field) {
	return !fieldIsMissing(field);
}

module.exports = Lookup;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Client.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Client.js ***!
  \*********************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 57:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Errors = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");
const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const Suggestion = __webpack_require__(/*! ./Suggestion */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Suggestion.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

/**
 * This client sends lookups to the SmartyStreets US Autocomplete API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	send(lookup) {
		if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

		let request = new Request();
		request.parameters = buildRequestParameters(lookup);

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(response => {
					if (response.error) reject(response.error);

					lookup.result = buildSuggestionsFromResponse(response.payload);
					resolve(lookup);
				})
				.catch(reject);
		});

		function buildRequestParameters(lookup) {
			return {
				prefix: lookup.prefix,
				suggestions: lookup.maxSuggestions,
				city_filter: joinFieldWith(lookup.cityFilter, ","),
				state_filter: joinFieldWith(lookup.stateFilter, ","),
				prefer: joinFieldWith(lookup.prefer, ";"),
				prefer_ratio: lookup.preferRatio,
				geolocate: lookup.geolocate,
				geolocate_precision: lookup.geolocatePrecision,
			};

			function joinFieldWith(field, delimiter) {
				if (field.length) return field.join(delimiter);
			}
		}

		function buildSuggestionsFromResponse(payload) {
			if (payload.suggestions === null) return [];

			return payload.suggestions.map(suggestion => new Suggestion(suggestion));
		}
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Lookup.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Lookup.js ***!
  \*********************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 24:0-14 */
/***/ ((module) => {

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#http-request-input-fields"
 */
class Lookup {
	/**
	 * @param prefix The beginning of an address. This is required to be set.
	 */
	constructor(prefix) {
		this.result = [];

		this.prefix = prefix;
		this.maxSuggestions = undefined;
		this.cityFilter = [];
		this.stateFilter = [];
		this.prefer = [];
		this.preferRatio = undefined;
		this.geolocate = undefined;
		this.geolocatePrecision = undefined;
	}
}

module.exports = Lookup;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Suggestion.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete/Suggestion.js ***!
  \*************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

/**
 * @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#http-response"
 */
class Suggestion {
	constructor(responseData) {
		this.text = responseData.text;
		this.streetLine = responseData.street_line;
		this.city = responseData.city;
		this.state = responseData.state;
	}
}

module.exports = Suggestion;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Client.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Client.js ***!
  \*************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 61:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Errors = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");
const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const Suggestion = __webpack_require__(/*! ./Suggestion */ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Suggestion.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");

/**
 * This client sends lookups to the SmartyStreets US Autocomplete Pro API, <br>
 *     and attaches the suggestions to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	send(lookup) {
		if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

		let request = new Request();
		request.parameters = buildRequestParameters(lookup);

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(response => {
					if (response.error) reject(response.error);

					lookup.result = buildSuggestionsFromResponse(response.payload);
					resolve(lookup);
				})
				.catch(reject);
		});

		function buildRequestParameters(lookup) {
			return {
				search: lookup.search,
				selected: lookup.selected,
				max_results: lookup.maxResults,
				include_only_cities: joinFieldWith(lookup.includeOnlyCities, ";"),
				include_only_states: joinFieldWith(lookup.includeOnlyStates, ";"),
				include_only_zip_codes: joinFieldWith(lookup.includeOnlyZIPCodes, ";"),
				exclude_states: joinFieldWith(lookup.excludeStates, ";"),
				prefer_cities: joinFieldWith(lookup.preferCities, ";"),
				prefer_states: joinFieldWith(lookup.preferStates, ";"),
				prefer_zip_codes: joinFieldWith(lookup.preferZIPCodes, ";"),
				prefer_ratio: lookup.preferRatio,
				prefer_geolocation: lookup.preferGeolocation,
			};

			function joinFieldWith(field, delimiter) {
				if (field.length) return field.join(delimiter);
			}
		}

		function buildSuggestionsFromResponse(payload) {
			if (payload.suggestions === null) return [];

			return payload.suggestions.map(suggestion => new Suggestion(suggestion));
		}
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Lookup.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Lookup.js ***!
  \*************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 28:0-14 */
/***/ ((module) => {

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#pro-http-request-input-fields"
 */
class Lookup {
	/**
	 * @param search The beginning of an address. This is required to be set.
	 */
	constructor(search) {
		this.result = [];

		this.search = search;
		this.selected = undefined;
		this.maxResults = undefined;
		this.includeOnlyCities = [];
		this.includeOnlyStates = [];
		this.includeOnlyZIPCodes = [];
		this.excludeStates = [];
		this.preferCities = [];
		this.preferStates = [];
		this.preferZIPCodes = [];
		this.preferRatio = undefined;
		this.preferGeolocation = undefined;
	}
}

module.exports = Lookup;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Suggestion.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_autocomplete_pro/Suggestion.js ***!
  \*****************************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module) => {

/**
 * @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#pro-http-response"
 */
class Suggestion {
	constructor(responseData) {
		this.streetLine = responseData.street_line;
		this.secondary = responseData.secondary;
		this.city = responseData.city;
		this.state = responseData.state;
		this.zipcode = responseData.zipcode;
		this.entries = responseData.entries;
	}
}

module.exports = Suggestion;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Address.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_extract/Address.js ***!
  \*****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 17:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Candidate = __webpack_require__(/*! ../us_street/Candidate */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Candidate.js");

/**
 * @see <a href="https://smartystreets.com/docs/cloud/us-extract-api#http-response-status">SmartyStreets US Extract API docs</a>
 */
class Address {
	constructor (responseData) {
		this.text = responseData.text;
		this.verified = responseData.verified;
		this.line = responseData.line;
		this.start = responseData.start;
		this.end = responseData.end;
		this.candidates = responseData.api_output.map(rawAddress => new Candidate(rawAddress));
	}
}

module.exports = Address;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Client.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_extract/Client.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 43:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Errors = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");
const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const Result = __webpack_require__(/*! ./Result */ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Result.js");

/**
 * This client sends lookups to the SmartyStreets US Extract API, <br>
 *     and attaches the results to the Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	send(lookup) {
		if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

		let request = new Request(lookup.text);
		request.parameters = buildRequestParams(lookup);

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(response => {
					if (response.error) reject(response.error);

					lookup.result = new Result(response.payload);
					resolve(lookup);
				})
				.catch(reject);
		});

		function buildRequestParams(lookup) {
			return {
				html: lookup.html,
				aggressive: lookup.aggressive,
				addr_line_breaks: lookup.addressesHaveLineBreaks,
				addr_per_line: lookup.addressesPerLine,
			};
		}
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Lookup.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_extract/Lookup.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 24:0-14 */
/***/ ((module) => {

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-extract-api#http-request-input-fields"
 */
class Lookup {
	/**
	 * @param text The text that is to have addresses extracted out of it for verification (required)
	 */
	constructor(text) {
		this.result = {
			meta: {},
			addresses: [],
		};
		//TODO: require the text field.
		this.text = text;
		this.html = undefined;
		this.aggressive = undefined;
		this.addressesHaveLineBreaks = undefined;
		this.addressesPerLine = undefined;
	}
}

module.exports = Lookup;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Result.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_extract/Result.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 21:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Address = __webpack_require__(/*! ./Address */ "./node_modules/smartystreets-javascript-sdk/src/us_extract/Address.js");

/**
 * @see <a href="https://smartystreets.com/docs/cloud/us-extract-api#http-response-status">SmartyStreets US Extract API docs</a>
 */
class Result {
	constructor({meta, addresses}) {
		this.meta = {
			lines: meta.lines,
			unicode: meta.unicode,
			addressCount: meta.address_count,
			verifiedCount: meta.verified_count,
			bytes: meta.bytes,
			characterCount: meta.character_count,
		};

		this.addresses = addresses.map(rawAddress => new Address(rawAddress));
	}
}

module.exports = Result;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_reverse_geo/Client.js":
/*!********************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_reverse_geo/Client.js ***!
  \********************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 39:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const buildInputData = __webpack_require__(/*! ../util/buildInputData */ "./node_modules/smartystreets-javascript-sdk/src/util/buildInputData.js");
const keyTranslationFormat = __webpack_require__(/*! ../util/apiToSDKKeyMap */ "./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js").usReverseGeo;
const {UndefinedLookupError} = __webpack_require__(/*! ../Errors.js */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");

/**
 * This client sends lookups to the SmartyStreets US Reverse Geo API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	send(lookup) {
		if (typeof lookup === "undefined") throw new UndefinedLookupError();

		let request = new Request();
		request.parameters = buildInputData(lookup, keyTranslationFormat);

		return new Promise((resolve, reject) => {
			this.sender.send(request)
				.then(response => {
					if (response.error) reject(response.error);

					resolve(attachLookupResults(response, lookup));
				})
				.catch(reject);
		});

		function attachLookupResults(response, lookup) {
			lookup.response = response.payload;

			return lookup;
		}
	}
}

module.exports = Client;


/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_street/Candidate.js":
/*!******************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_street/Candidate.js ***!
  \******************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 78:0-14 */
/***/ ((module) => {

/**
 * A candidate is a possible match for an address that was submitted.<br>
 *     A lookup can have multiple candidates if the address was ambiguous, and<br>
 *     the maxCandidates field is set higher than 1.
 *
 * @see "https://smartystreets.com/docs/cloud/us-street-api#root"
 */
class Candidate {
	constructor(responseData) {
		this.inputIndex = responseData.input_index;
		this.candidateIndex = responseData.candidate_index;
		this.addressee = responseData.addressee;
		this.deliveryLine1 = responseData.delivery_line_1;
		this.deliveryLine2 = responseData.delivery_line_2;
		this.lastLine = responseData.last_line;
		this.deliveryPointBarcode = responseData.delivery_point_barcode;

		this.components = {};
		if (responseData.components !== undefined) {
			this.components.urbanization = responseData.components.urbanization;
			this.components.primaryNumber = responseData.components.primary_number;
			this.components.streetName = responseData.components.street_name;
			this.components.streetPredirection = responseData.components.street_predirection;
			this.components.streetPostdirection = responseData.components.street_postdirection;
			this.components.streetSuffix = responseData.components.street_suffix;
			this.components.secondaryNumber = responseData.components.secondary_number;
			this.components.secondaryDesignator = responseData.components.secondary_designator;
			this.components.extraSecondaryNumber = responseData.components.extra_secondary_number;
			this.components.extraSecondaryDesignator = responseData.components.extra_secondary_designator;
			this.components.pmbDesignator = responseData.components.pmb_designator;
			this.components.pmbNumber = responseData.components.pmb_number;
			this.components.cityName = responseData.components.city_name;
			this.components.defaultCityName = responseData.components.default_city_name;
			this.components.state = responseData.components.state_abbreviation;
			this.components.zipCode = responseData.components.zipcode;
			this.components.plus4Code = responseData.components.plus4_code;
			this.components.deliveryPoint = responseData.components.delivery_point;
			this.components.deliveryPointCheckDigit = responseData.components.delivery_point_check_digit;
		}

		this.metadata = {};
		if (responseData.metadata !== undefined) {
			this.metadata.recordType = responseData.metadata.record_type;
			this.metadata.zipType = responseData.metadata.zip_type;
			this.metadata.countyFips = responseData.metadata.county_fips;
			this.metadata.countyName = responseData.metadata.county_name;
			this.metadata.carrierRoute = responseData.metadata.carrier_route;
			this.metadata.congressionalDistrict = responseData.metadata.congressional_district;
			this.metadata.buildingDefaultIndicator = responseData.metadata.building_default_indicator;
			this.metadata.rdi = responseData.metadata.rdi;
			this.metadata.elotSequence = responseData.metadata.elot_sequence;
			this.metadata.elotSort = responseData.metadata.elot_sort;
			this.metadata.latitude = responseData.metadata.latitude;
			this.metadata.longitude = responseData.metadata.longitude;
			this.metadata.precision = responseData.metadata.precision;
			this.metadata.timeZone = responseData.metadata.time_zone;
			this.metadata.utcOffset = responseData.metadata.utc_offset;
			this.metadata.obeysDst = responseData.metadata.dst;
			this.metadata.isEwsMatch = responseData.metadata.ews_match;
		}

		this.analysis = {};
		if (responseData.analysis !== undefined) {
			this.analysis.dpvMatchCode = responseData.analysis.dpv_match_code;
			this.analysis.dpvFootnotes = responseData.analysis.dpv_footnotes;
			this.analysis.cmra = responseData.analysis.dpv_cmra;
			this.analysis.vacant = responseData.analysis.dpv_vacant;
			this.analysis.active = responseData.analysis.active;
			this.analysis.isEwsMatch = responseData.analysis.ews_match; // Deprecated, refer to metadata.ews_match
			this.analysis.footnotes = responseData.analysis.footnotes;
			this.analysis.lacsLinkCode = responseData.analysis.lacslink_code;
			this.analysis.lacsLinkIndicator = responseData.analysis.lacslink_indicator;
			this.analysis.isSuiteLinkMatch = responseData.analysis.suitelink_match;
		}
	}
}

module.exports = Candidate;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_street/Client.js":
/*!***************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_street/Client.js ***!
  \***************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 41:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Candidate = __webpack_require__(/*! ./Candidate */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Candidate.js");
const Lookup = __webpack_require__(/*! ./Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_street/Lookup.js");
const Batch = __webpack_require__(/*! ../Batch */ "./node_modules/smartystreets-javascript-sdk/src/Batch.js");
const UndefinedLookupError = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").UndefinedLookupError;
const sendBatch = __webpack_require__(/*! ../util/sendBatch */ "./node_modules/smartystreets-javascript-sdk/src/util/sendBatch.js");
const keyTranslationFormat = __webpack_require__(/*! ../util/apiToSDKKeyMap */ "./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js").usStreet;

/**
 * This client sends lookups to the SmartyStreets US Street API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	/**
	 * Sends up to 100 lookups for validation.
	 * @param data may be a Lookup object, or a Batch which must contain between 1 and 100 Lookup objects
	 * @throws SmartyException
	 */
	send(data) {
		const dataIsBatch = data instanceof Batch;
		const dataIsLookup = data instanceof Lookup;

		if (!dataIsLookup && !dataIsBatch) throw new UndefinedLookupError;

		let batch;

		if (dataIsLookup) {
			batch = new Batch();
			batch.add(data);
		} else {
			batch = data;
		}

		return sendBatch(batch, this.sender, Candidate, keyTranslationFormat);
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_street/Lookup.js":
/*!***************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_street/Lookup.js ***!
  \***************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 24:0-14 */
/***/ ((module) => {

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-street-api#input-fields"
 */
class Lookup {
	constructor(street, street2, secondary, city, state, zipCode, lastLine, addressee, urbanization, match, maxCandidates, inputId) {
		this.street = street;
		this.street2 = street2;
		this.secondary = secondary;
		this.city = city;
		this.state = state;
		this.zipCode = zipCode;
		this.lastLine = lastLine;
		this.addressee = addressee;
		this.urbanization = urbanization;
		this.match = match;
		this.maxCandidates = maxCandidates;
		this.inputId = inputId;
		this.result = [];
	}
}

module.exports = Lookup;


/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Client.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Client.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 39:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Lookup = __webpack_require__(/*! ./Lookup */ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Lookup.js");
const Result = __webpack_require__(/*! ./Result */ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Result.js");
const Batch = __webpack_require__(/*! ../Batch */ "./node_modules/smartystreets-javascript-sdk/src/Batch.js");
const UndefinedLookupError = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js").UndefinedLookupError;
const sendBatch = __webpack_require__(/*! ../util/sendBatch */ "./node_modules/smartystreets-javascript-sdk/src/util/sendBatch.js");
const keyTranslationFormat = __webpack_require__(/*! ../util/apiToSDKKeyMap */ "./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js").usZipcode;

/**
 * This client sends lookups to the SmartyStreets US ZIP Code API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */
class Client {
	constructor(sender) {
		this.sender = sender;
	}

	/**
	 * Sends up to 100 lookups for validation.
	 * @param data May be a Lookup object, or a Batch which must contain between 1 and 100 Lookup objects
	 * @throws SmartyException
	 */
	send(data) {
		const dataIsBatch = data instanceof Batch;
		const dataIsLookup = data instanceof Lookup;

		if (!dataIsLookup && !dataIsBatch) throw new UndefinedLookupError;

		let batch;

		if (dataIsLookup) {
			batch = new Batch();
			batch.add(data);
		} else batch = data;

		return sendBatch(batch, this.sender, Result, keyTranslationFormat);
	}
}

module.exports = Client;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Lookup.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Lookup.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 16:0-14 */
/***/ ((module) => {

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-zipcode-api#http-request-input-fields"
 */
class Lookup {
	constructor(city, state, zipCode, inputId) {
		this.city = city;
		this.state = state;
		this.zipCode = zipCode;
		this.inputId = inputId;
		this.result = [];
	}
}

module.exports = Lookup;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Result.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/us_zipcode/Result.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 45:0-14 */
/***/ ((module) => {

/**
 * @see "https://smartystreets.com/docs/cloud/us-zipcode-api#root"
 */
class Result {
	constructor(responseData) {
		this.inputIndex = responseData.input_index;
		this.status = responseData.status;
		this.reason = responseData.reason;
		this.valid = this.status === undefined && this.reason === undefined;

		this.cities = !responseData.city_states ? [] : responseData.city_states.map(city => {
			return {
				city: city.city,
				stateAbbreviation: city.state_abbreviation,
				state: city.state,
				mailableCity: city.mailable_city,
			};
		});

		this.zipcodes = !responseData.zipcodes ? [] : responseData.zipcodes.map(zipcode => {
			return {
				zipcode: zipcode.zipcode,
				zipcodeType: zipcode.zipcode_type,
				defaultCity: zipcode.default_city,
				countyFips: zipcode.county_fips,
				countyName: zipcode.county_name,
				latitude: zipcode.latitude,
				longitude: zipcode.longitude,
				precision: zipcode.precision,
				stateAbbreviation: zipcode.state_abbreviation,
				state: zipcode.state,
				alternateCounties: !zipcode.alternate_counties ? [] : zipcode.alternate_counties.map(county => {
					return {
						countyFips: county.county_fips,
						countyName: county.county_name,
						stateAbbreviation: county.state_abbreviation,
						state: county.state,
					}
				}),
			};
		});
	}
}

module.exports = Result;

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js":
/*!******************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/util/apiToSDKKeyMap.js ***!
  \******************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = {
	usStreet: {
		"street": "street",
		"street2": "street2",
		"secondary": "secondary",
		"city": "city",
		"state": "state",
		"zipcode": "zipCode",
		"lastline": "lastLine",
		"addressee": "addressee",
		"urbanization": "urbanization",
		"match": "match",
		"candidates": "maxCandidates",
	},
	usZipcode: {
		"city": "city",
		"state": "state",
		"zipcode": "zipCode",
	},
	internationalStreet: {
		"country": "country",
		"freeform": "freeform",
		"address1": "address1",
		"address2": "address2",
		"address3": "address3",
		"address4": "address4",
		"organization": "organization",
		"locality": "locality",
		"administrative_area": "administrativeArea",
		"postal_code": "postalCode",
		"geocode": "geocode",
		"language": "language",
	},
	usReverseGeo: {
		"latitude": "latitude",
		"longitude": "longitude",
	}
};

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/util/buildClients.js":
/*!****************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/util/buildClients.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 35:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ClientBuilder = __webpack_require__(/*! ../ClientBuilder */ "./node_modules/smartystreets-javascript-sdk/src/ClientBuilder.js");

function instantiateClientBuilder(credentials) {
	return new ClientBuilder(credentials);
}

function buildUsStreetApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsStreetApiClient();
}

function buildUsAutocompleteApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsAutocompleteClient();
}

function buildUsAutocompleteProApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsAutocompleteProClient();
}

function buildUsExtractApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsExtractClient();
}

function buildUsZipcodeApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsZipcodeClient();
}

function buildInternationalStreetApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildInternationalStreetClient();
}

function buildUsReverseGeoApiClient(credentials) {
	return instantiateClientBuilder(credentials).buildUsReverseGeoClient();
}

module.exports = {
	usStreet: buildUsStreetApiClient,
	usAutocomplete: buildUsAutocompleteApiClient,
	usAutocompletePro: buildUsAutocompleteProApiClient,
	usExtract: buildUsExtractApiClient,
	usZipcode: buildUsZipcodeApiClient,
	internationalStreet: buildInternationalStreetApiClient,
	usReverseGeo: buildUsReverseGeoApiClient,
};

/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/util/buildInputData.js":
/*!******************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/util/buildInputData.js ***!
  \******************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const InputData = __webpack_require__(/*! ../InputData */ "./node_modules/smartystreets-javascript-sdk/src/InputData.js");

module.exports = (lookup, keyTranslationFormat) => {
	let inputData = new InputData(lookup);

	for (let key in keyTranslationFormat) {
		inputData.add(key, keyTranslationFormat[key]);
	}

	return inputData.data;
};


/***/ }),

/***/ "./node_modules/smartystreets-javascript-sdk/src/util/sendBatch.js":
/*!*************************************************************************!*\
  !*** ./node_modules/smartystreets-javascript-sdk/src/util/sendBatch.js ***!
  \*************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 6:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Request = __webpack_require__(/*! ../Request */ "./node_modules/smartystreets-javascript-sdk/src/Request.js");
const Promise = __webpack_require__(/*! promise */ "./node_modules/promise/index.js");
const Errors = __webpack_require__(/*! ../Errors */ "./node_modules/smartystreets-javascript-sdk/src/Errors.js");
const buildInputData = __webpack_require__(/*! ../util/buildInputData */ "./node_modules/smartystreets-javascript-sdk/src/util/buildInputData.js");

module.exports = (batch, sender, Result, keyTranslationFormat) => {
	if (batch.isEmpty()) throw new Errors.BatchEmptyError;

	let request = new Request();

	if (batch.length() === 1) request.parameters = generateRequestPayload(batch)[0];
	else request.payload = generateRequestPayload(batch);

	return new Promise((resolve, reject) => {
		sender.send(request)
			.then(response => {
				if (response.error) reject(response.error);

				resolve(assignResultsToLookups(batch, response));
			})
			.catch(reject);
	});

	function generateRequestPayload(batch) {
		return batch.lookups.map((lookup) => {
			return buildInputData(lookup, keyTranslationFormat);
		});
	}

	function assignResultsToLookups(batch, response) {
		response.payload.map(rawResult => {
			let result = new Result(rawResult);
			let lookup = batch.getByIndex(result.inputIndex);

			lookup.result.push(result);
		});

		return batch;
	}
};


/***/ }),

/***/ "webpack/container/entry/orderService":
/*!***********************!*\
  !*** container entry ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__.d, __webpack_require__.o, __webpack_exports__, __webpack_require__.e, __webpack_require__, __webpack_require__.* */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var moduleMap = {
	"./service1": () => {
		return __webpack_require__.e("src_services_service1_js").then(() => () => (__webpack_require__(/*! ./src/services/service1 */ "./src/services/service1.js")));
	},
	"./publish-event": () => {
		return __webpack_require__.e("src_services_publish-event_js").then(() => () => (__webpack_require__(/*! ./src/services/publish-event */ "./src/services/publish-event.js")));
	},
	"./models": () => {
		return __webpack_require__.e("src_models_index_js").then(() => () => (__webpack_require__(/*! ./src/models */ "./src/models/index.js")));
	},
	"./orderService": () => {
		return __webpack_require__.e("src_services_order-service_js").then(() => () => (__webpack_require__(/*! ../../../src/services/order-service */ "./src/services/order-service.js")));
	},
	"./paymentService": () => {
		return __webpack_require__.e("src_services_real-payment-service_js").then(() => () => (__webpack_require__(/*! ../../../src/services/real-payment-service */ "./src/services/real-payment-service.js")));
	},
	"./shippingService": () => {
		return __webpack_require__.e("src_services_real-shipping-service_js").then(() => () => (__webpack_require__(/*! ../../../src/services/real-shipping-service */ "./src/services/real-shipping-service.js")));
	},
	"./addressService": () => {
		return __webpack_require__.e("src_services_real-address-service_js").then(() => () => (__webpack_require__(/*! ../../../src/services/real-address-service */ "./src/services/real-address-service.js")));
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

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "domain":
/*!*************************!*\
  !*** external "domain" ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("domain");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 		__webpack_require__.p = "http://localhost:8060";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	(() => {
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		__webpack_require__.I = (name) => {
/******/ 			// only runs once
/******/ 			if(initPromises[name]) return initPromises[name];
/******/ 			// handling circular init calls
/******/ 			initPromises[name] = 1;
/******/ 			// creates a new share scope if needed
/******/ 			if(!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {};
/******/ 			// runs all init snippets from all modules reachable
/******/ 			var scope = __webpack_require__.S[name];
/******/ 			var warn = (msg) => typeof console !== "undefined" && console.warn && console.warn(msg);;
/******/ 			var uniqueName = "federated-monolith-services";
/******/ 			var register = (name, version, factory) => {
/******/ 				var versions = scope[name] = scope[name] || {};
/******/ 				var activeVersion = versions[version];
/******/ 				if(!activeVersion || !activeVersion.loaded && uniqueName > activeVersion.from) versions[version] = { get: factory, from: uniqueName };
/******/ 			};
/******/ 			var initExternal = (id) => {
/******/ 				var handleError = (err) => warn("Initialization of sharing external failed: " + err);
/******/ 				try {
/******/ 					var module = __webpack_require__(id);
/******/ 					if(!module) return;
/******/ 					var initFn = (module) => module && module.init && module.init(__webpack_require__.S[name])
/******/ 					if(module.then) return promises.push(module.then(initFn, handleError));
/******/ 					var initResult = initFn(module);
/******/ 					if(initResult && initResult.then) return promises.push(initResult.catch(handleError));
/******/ 				} catch(err) { handleError(err); }
/******/ 			}
/******/ 			var promises = [];
/******/ 			switch(name) {
/******/ 				case "default": {
/******/ 					register("axios", "0.20.0", () => () => __webpack_require__(/*! ./node_modules/axios/index.js */ "./node_modules/axios/index.js"));
/******/ 					register("smartystreets-javascript-sdk", "1.6.0", () => () => __webpack_require__(/*! ./node_modules/smartystreets-javascript-sdk/index.js */ "./node_modules/smartystreets-javascript-sdk/index.js"));
/******/ 				}
/******/ 				break;
/******/ 			}
/******/ 			return promises.length && (initPromises[name] = Promise.all(promises).then(() => initPromises[name] = 1));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/consumes */
/******/ 	(() => {
/******/ 		var parseVersion = (str) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			var p=p=>{return p.split(".").map((p=>{return+p==p?+p:p}))},n=/^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(str),r=n[1]?p(n[1]):[];return n[2]&&(r.length++,r.push.apply(r,p(n[2]))),n[3]&&(r.push([]),r.push.apply(r,p(n[3]))),r;
/******/ 		}
/******/ 		var versionLt = (a, b) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			a=parseVersion(a),b=parseVersion(b);for(var r=0;;){if(r>=a.length)return r<b.length&&"u"!=(typeof b[r])[0];var e=a[r],n=(typeof e)[0];if(r>=b.length)return"u"==n;var t=b[r],f=(typeof t)[0];if(n!=f)return"o"==n&&"n"==f||("s"==f||"u"==n);if("o"!=n&&"u"!=n&&e!=t)return e<t;r++}
/******/ 		}
/******/ 		var rangeToString = (range) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			if(1===range.length)return"*";if(0 in range){var r="",n=range[0];r+=0==n?">=":-1==n?"<":1==n?"^":2==n?"~":n>0?"=":"!=";for(var e=1,a=1;a<range.length;a++){e--,r+="u"==(typeof(t=range[a]))[0]?"-":(e>0?".":"")+(e=2,t)}return r}var g=[];for(a=1;a<range.length;a++){var t=range[a];g.push(0===t?"not("+o()+")":1===t?"("+o()+" || "+o()+")":2===t?g.pop()+" "+g.pop():rangeToString(t))}return o();function o(){return g.pop().replace(/^\((.+)\)$/,"$1")}
/******/ 		}
/******/ 		var satisfy = (range, version) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			if(0 in range){version=parseVersion(version);var e=range[0],r=e<0;r&&(e=-e-1);for(var n=0,i=1,a=!0;;i++,n++){var f,s,g=i<range.length?(typeof range[i])[0]:"";if(n>=version.length||"o"==(s=(typeof(f=version[n]))[0]))return!a||("u"==g?i>e&&!r:""==g!=r);if("u"==s){if(!a||"u"!=g)return!1}else if(a)if(g==s)if(i<=e){if(f!=range[i])return!1}else{if(r?f>range[i]:f<range[i])return!1;f!=range[i]&&(a=!1)}else if("s"!=g&&"n"!=g){if(r||i<=e)return!1;a=!1,i--}else{if(i<=e||s<g!=r)return!1;a=!1}else"s"!=g&&"n"!=g&&(a=!1,i--)}}var t=[],o=t.pop.bind(t);for(n=1;n<range.length;n++){var u=range[n];t.push(1==u?o()|o():2==u?o()&o():u?satisfy(u,version):!o())}return!!o();
/******/ 		}
/******/ 		var ensureExistence = (scopeName, key) => {
/******/ 			var scope = __webpack_require__.S[scopeName];
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) throw new Error("Shared module " + key + " doesn't exist in shared scope " + scopeName);
/******/ 			return scope;
/******/ 		};
/******/ 		var findVersion = (scope, key) => {
/******/ 			var versions = scope[key];
/******/ 			var key = Object.keys(versions).reduce((a, b) => {
/******/ 				return !a || versionLt(a, b) ? b : a;
/******/ 			}, 0);
/******/ 			return key && versions[key]
/******/ 		};
/******/ 		var findSingletonVersionKey = (scope, key) => {
/******/ 			var versions = scope[key];
/******/ 			return Object.keys(versions).reduce((a, b) => {
/******/ 				return !a || (!versions[a].loaded && versionLt(a, b)) ? b : a;
/******/ 			}, 0);
/******/ 		};
/******/ 		var getInvalidSingletonVersionMessage = (key, version, requiredVersion) => {
/******/ 			return "Unsatisfied version " + version + " of shared singleton module " + key + " (required " + rangeToString(requiredVersion) + ")"
/******/ 		};
/******/ 		var getSingletonVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var version = findSingletonVersionKey(scope, key);
/******/ 			if (!satisfy(requiredVersion, version)) typeof console !== "undefined" && console.warn && console.warn(getInvalidSingletonVersionMessage(key, version, requiredVersion));
/******/ 			return get(scope[key][version]);
/******/ 		};
/******/ 		var getStrictSingletonVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var version = findSingletonVersionKey(scope, key);
/******/ 			if (!satisfy(requiredVersion, version)) throw new Error(getInvalidSingletonVersionMessage(key, version, requiredVersion));
/******/ 			return get(scope[key][version]);
/******/ 		};
/******/ 		var findValidVersion = (scope, key, requiredVersion) => {
/******/ 			var versions = scope[key];
/******/ 			var key = Object.keys(versions).reduce((a, b) => {
/******/ 				if (!satisfy(requiredVersion, b)) return a;
/******/ 				return !a || versionLt(a, b) ? b : a;
/******/ 			}, 0);
/******/ 			return key && versions[key]
/******/ 		};
/******/ 		var getInvalidVersionMessage = (scope, scopeName, key, requiredVersion) => {
/******/ 			var versions = scope[key];
/******/ 			return "No satisfying version (" + rangeToString(requiredVersion) + ") of shared module " + key + " found in shared scope " + scopeName + ".\n" +
/******/ 				"Available versions: " + Object.keys(versions).map((key) => {
/******/ 				return key + " from " + versions[key].from;
/******/ 			}).join(", ");
/******/ 		};
/******/ 		var getValidVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var entry = findValidVersion(scope, key, requiredVersion);
/******/ 			if(entry) return get(entry);
/******/ 			throw new Error(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
/******/ 		};
/******/ 		var warnInvalidVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			typeof console !== "undefined" && console.warn && console.warn(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
/******/ 		};
/******/ 		var get = (entry) => {
/******/ 			entry.loaded = 1;
/******/ 			return entry.get()
/******/ 		};
/******/ 		var init = (fn) => function(scopeName, a, b, c) {
/******/ 			var promise = __webpack_require__.I(scopeName);
/******/ 			if (promise.then) return promise.then(fn.bind(fn, scopeName, __webpack_require__.S[scopeName], a, b, c));
/******/ 			return fn(scopeName, __webpack_require__.S[scopeName], a, b, c);
/******/ 		};
/******/ 		
/******/ 		var load = /*#__PURE__*/ init((scopeName, scope, key) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return get(findVersion(scope, key));
/******/ 		});
/******/ 		var loadFallback = /*#__PURE__*/ init((scopeName, scope, key, fallback) => {
/******/ 			return scope && __webpack_require__.o(scope, key) ? get(findVersion(scope, key)) : fallback();
/******/ 		});
/******/ 		var loadVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
/******/ 		});
/******/ 		var loadSingletonVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getValidVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictSingletonVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getStrictSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
/******/ 		});
/******/ 		var loadSingletonVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return getSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			var entry = scope && __webpack_require__.o(scope, key) && findValidVersion(scope, key, version);
/******/ 			return entry ? get(entry) : fallback();
/******/ 		});
/******/ 		var loadStrictSingletonVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return getStrictSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var installedModules = {};
/******/ 		var moduleToHandlerMapping = {
/******/ 			"webpack/sharing/consume/default/smartystreets-javascript-sdk/smartystreets-javascript-sdk": () => loadStrictVersionCheckFallback("default", "smartystreets-javascript-sdk", [1,1,6,0], () => () => __webpack_require__(/*! smartystreets-javascript-sdk */ "./node_modules/smartystreets-javascript-sdk/index.js")),
/******/ 			"webpack/sharing/consume/default/axios/axios": () => loadStrictVersionCheckFallback("default", "axios", [2,0,20,0], () => () => __webpack_require__(/*! axios */ "./node_modules/axios/index.js"))
/******/ 		};
/******/ 		// no consumes in initial chunks
/******/ 		var chunkMapping = {
/******/ 			"src_models_index_js": [
/******/ 				"webpack/sharing/consume/default/smartystreets-javascript-sdk/smartystreets-javascript-sdk"
/******/ 			],
/******/ 			"src_services_order-service_js": [
/******/ 				"webpack/sharing/consume/default/axios/axios"
/******/ 			],
/******/ 			"src_services_real-address-service_js": [
/******/ 				"webpack/sharing/consume/default/smartystreets-javascript-sdk/smartystreets-javascript-sdk"
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.f.consumes = (chunkId, promises) => {
/******/ 			if(__webpack_require__.o(chunkMapping, chunkId)) {
/******/ 				chunkMapping[chunkId].forEach((id) => {
/******/ 					if(__webpack_require__.o(installedModules, id)) return promises.push(installedModules[id]);
/******/ 					var onFactory = (factory) => {
/******/ 						installedModules[id] = 0;
/******/ 						__webpack_modules__[id] = (module) => {
/******/ 							delete __webpack_module_cache__[id];
/******/ 							module.exports = factory();
/******/ 						}
/******/ 					};
/******/ 					var onError = (error) => {
/******/ 						delete installedModules[id];
/******/ 						__webpack_modules__[id] = (module) => {
/******/ 							delete __webpack_module_cache__[id];
/******/ 							throw error;
/******/ 						}
/******/ 					};
/******/ 					try {
/******/ 						var promise = moduleToHandlerMapping[id]();
/******/ 						if(promise.then) {
/******/ 							promises.push(installedModules[id] = promise.then(onFactory).catch(onError));
/******/ 						} else onFactory(promise);
/******/ 					} catch(e) { onError(e); }
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/readFile chunk loading */
/******/ 	(() => {
/******/ 		function httpRequest(params) {
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
/******/ 			"orderService": 0
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
/******/ 	return __webpack_require__("webpack/container/entry/orderService");
/******/ })()
;
//# sourceMappingURL=remoteEntry.js.map