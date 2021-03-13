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

const Server = (() => {
  const apiRoot = "/api";
  const endpoint = e => `${apiRoot}/${e}`;
  const endpointId = e => `${apiRoot}/${e}/:id`;
  const endpointCmd = e => `${apiRoot}/${e}/:id/:command`;

  const getRemoteModules = __non_webpack_require__("./remoteEntry")
    .microlib.get("./models")
    .then(factory => {
      const Module = factory();
      return Module.initRemotes;
    });

  function makeAdmin(path, app, adapter) {
    app.get(path("config"), adapter(getConfig()));
  }

  function make(path, app, method, controllers) {
    controllers().forEach(ctlr => {
      console.info(ctlr);
      app[method](path(ctlr.endpoint), http(ctlr.fn));
    });
  }

  function clear() {    
    try {
      ModelFactory.clearModels();

      Object.keys(__non_webpack_require__.cache).forEach(k => {
        console.log("deleting cached module", k);
        delete __non_webpack_require__.cache[k];
      });
    } catch (error) {
      console.error(error);
    }
  }

  function start(router) {
    const label = "\ntotal time to import & register remote modules";
    console.time(label);

    const overrides = { save, find, Persistence };

    getRemoteModules.then(initRemotes => {
      initRemotes(overrides).then(() => {
        const cache = initCache();

        make(endpoint, router, "post", postModels);
        make(endpoint, router, "get", getModels);
        make(endpointId, router, "get", getModelsById);
        make(endpointId, router, "patch", patchModels);
        make(endpointCmd, router, "patch", patchModels);
        make(endpointId, router, "delete", deleteModels);

        console.timeEnd(label);

        makeAdmin(endpoint, router, http);

        cache.load();

        console.log("http://localhost:8070");

        process.on("SIGTERM", () => close());
      });
    });
  }

  return {
    clear,
    start,
  };
})();

export default Server;
