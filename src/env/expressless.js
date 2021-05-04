"use strict";

/**
 * collect the routes and callbacks
 */
const routes = new Map();

function addController(path, method, callback) {
  if (routes.has(path)) {
    routes.set(path, { ...routes.get(path), [method]: callback });
    return;
  }
  routes.set(path, { [method]: callback });
}

/**
 * Overrides express methods to record routes for serverless execution.
 * @param {*} app
 * @param {*} serverless
 * @returns
 */
module.exports.expressless = function (app, serverless = true) {
  if (!serverless) {
    return app;
  }

  return {
    async controller(path, method, request) {
      try {
        return routes.get(path)[method](request);
      } catch (error) {
        console.error(error);
      }
    },
    get(path, callback) {
      addController(path, this.get.name, callback);
      app.get(path, arguments);
    },
    post(path, callback) {
      addController(path, this.post.name, callback);
      app.post(path, callback);
    },
    patch(path, callback) {
      addController(path, this.patch.name, callback);
      app.patch(path, callback);
    },
    put(path, callback) {
      addController(path, this.put.name, callback);
      app.put(path, callback);
    },
    delete(path, callback) {
      addController(path, this.delete.name, callback);
      app.delete(path, callback);
    },
    use(path, callback) {
      addController(path, this.use.name, callback);
      app.use(path, callback);
    },
    all(path, callback) {
      addController(path, this.all.name, callback);
      app.all(path, callback);
    },
  };
};

const parsers = {
  aws: args => ({ req: { ...args }, res }),
  azure: args => ({ req: { ...args }, res }),
  google: args => ({ req: { ...args }, res }),
  ibm: args => ({ req: { ...args }, res }),
  undefined: args => ({ req: { ...args }, res }),
};

const res = {
  send(data) {
    console.log("send", data);
    return data;
  },
  status(num) {
    console.log("status", num);
    return this;
  },
  set(data) {
    console.log("set", data);
  },
  headers: {},
  type: data => console.log(data),
};

// function findCallback(app, path, method) {
//   try {
//     function findLayer(stack) {
//       if (!stack) return null;

//       const handleLayer = stack
//         .filter(function (layer) {
//           return layer && layer.route && layer.route.path === path;
//         })
//         .map(function (layer) {
//           return layer.route.stack.find(l => l.method);
//         })
//         .find(l => l.method === method);

//       return handleLayer;
//     }
//     const layer = findLayer(app._router.stack);
//     console.debug("findLayer", layer);
//     return layer.handle;
//   } catch (e) {
//     console.error(e);
//   }
// }

function invokeCallbacks(app, provider) {
  console.debug({ [invokeCallbacks.name]: app, provider });
  const parse = parsers[provider.toLowerCase()];

  app.invokeCallback = async function (...args) {
    const { req, res } = parse(...args);
    const callback = findCallback(app, req.path, req.method);

    if (callback) {
      try {
        await callback(req, res);
        return res.send();
      } catch (e) {
        console.error(e);
      }
    }
    console.debug("no callback found");
  };

  return function (req, res) {};
}

module.exports = { invokeCallbacks };
