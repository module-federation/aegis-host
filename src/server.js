"use strict";

import {
  postModels,
  patchModels,
  getModels,
  getModelsById,
  deleteModels,
  initCache,
  getConfig,
} from "./controllers";

import { Persistence } from "./services/persistence-service";
import { save, find, close } from "./adapters/persistence-adapter";
import http from "./adapters/http-adapter";
import ModelFactory from "./models";

const apiRoot = process.env.API_ROOT || "/microlib/api";
const modelPath = `${apiRoot}/models`;

const idRoute = route =>
  route.split("/").splice(0, 5).concat([":id"]).join("/");

const cmdRoute = route =>
  route.split("/").splice(0, 6).concat([":id", ":command"]).join("/");

class RouteMap extends Map {
  has(route) {
    if (!route) {
      console.warn("route is ", typeof route);
      return false;
    }

    if (super.has(route)) {
      this.route = super.get(route);
      return true;
    }

    const idInstance = idRoute(route);
    if (route.match(/\//g).length === 5 && super.has(idInstance)) {
      this.route = super.get(idInstance);
      return true;
    }

    const cmdInstance = cmdRoute(route);
    if (route.match(/\//g).length === 6 && super.has(cmdInstance)) {
      this.route = super.get(cmdInstance);
      return true;
    }
    return false;
  }

  get(route) {
    return this.route ? this.route : super.get(route);
  }
}

function isServerless() {
  return (
    /serverless/i.test(process.title) || /true/i.test(process.env.SERVERLESS)
  );
}

const Server = (() => {
  const routes = new RouteMap();
  const serverless = isServerless();
  const serverMode = serverless ? "serverless" : "webserver";

  const endpoint = e => `${modelPath}/${e}`;
  const endpointId = e => `${modelPath}/${e}/:id`;
  const endpointCmd = e => `${modelPath}/${e}/:id/:command`;

  const remoteEntry = __non_webpack_require__("./remoteEntry");

  const getRemoteModules = remoteEntry.microlib
    .get("./models")
    .then(factory => {
      const Module = factory();
      return Module.initRemotes;
    });

  const getRemoteEntries = remoteEntry.microlib
    .get("./remoteEntries")
    .then(factory => factory());

  function makeAdmin(app, adapter) {
    app.get(`${apiRoot}/config`, adapter(getConfig()));
    routes.set(`${apiRoot}/config`, { get: adapter(getConfig()) });
  }

  const make = {
    /**
     * webServer mode - create routes and register controllers
     * @param {*} path
     * @param {*} app
     * @param {*} method
     * @param {*} controllers
     */
    webserver(path, method, controllers, app) {
      controllers().forEach(ctlr => {
        console.info(ctlr);
        app[method](path(ctlr.endpoint), http(ctlr.fn));
      });
    },

    /**
     * serverless mode - save routes, etc for fast lookup
     * @param {*} path
     * @param {*} method
     * @param {*} controllers
     */
    serverless(path, method, controllers) {
      controllers().forEach(ctlr => {
        const route = path(ctlr.endpoint);
        if (routes.has(route)) {
          routes.set(route, {
            ...routes.get(route),
            [method]: http(ctlr.fn),
          });
          return;
        }
        routes.set(route, { [method]: http(ctlr.fn) });
      });
    },
  };

  /**
   * Call controllers directly in serverless mode.
   */
  async function control(path, method, req, res) {
    if (routes.has(path)) {
      try {
        console.debug("path match: ", path);
        const fn = routes.get(path)[method];
        if (fn) {
          console.debug("method match:", method);
          return await fn(req, res);
        }
        console.warn("method not supported", path, method);
      } catch (error) {
        console.error("problem running controller", error);
      }
    }
    console.warn("potential config issue", path, method);
  }

  function shutdown(shutdownTasks) {
    console.warn("Received SIGTERM - system shutdown in progress");
    shutdownTasks();
  }

  /**
   * Clear all non-webpack module cache, i.e.
   * everything bundled by remoteEntry.js (models
   * & remoteEntry config), which includes all the
   * user code downloaded from the remote. This is
   * the code that needs to be disposed of & reimported.
   */
  function clear() {
    try {
      close();
      routes.clear();
      ModelFactory.clearModels();

      Object.keys(__non_webpack_require__.cache).forEach(k => {
        console.log("deleting cached module", k);
        delete __non_webpack_require__.cache[k];
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function start(router) {
    const label = "\ntotal time to import & register remote modules";
    console.time(label);
    const overrides = { save, find, Persistence };

    return getRemoteEntries.then(remotes => {
      return getRemoteModules.then(initRemotes => {
        return initRemotes(remotes, overrides).then(async () => {
          const cache = initCache();

          console.info(`running in ${serverMode} mode`);

          make[serverMode](endpoint, "get", getModels, router);
          make[serverMode](endpoint, "post", postModels, router);
          make[serverMode](endpointId, "get", getModelsById, router);
          make[serverMode](endpointId, "patch", patchModels, router);
          make[serverMode](endpointId, "delete", deleteModels, router);
          make[serverMode](endpointCmd, "patch", patchModels, router);

          makeAdmin(router, http);
          console.timeEnd(label);
          console.info(routes);

          await cache.load();
          process.on("sigterm", () => shutdown(() => close()));
          return control;
        });
      });
    });
  }

  return {
    clear,
    start,
    control,
  };
})();

export default Server;
