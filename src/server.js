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
  const API_ROOT = "/api";
  const ENDPOINT = e => `${API_ROOT}/${e}`;
  const ENDPOINTID = e => `${API_ROOT}/${e}/:id`;
  const ENDPOINTCMD = e => `${API_ROOT}/${e}/:id/:command`;

  const getRemoteModules = __non_webpack_require__("./remoteEntry")
    .microlib.get("./models")
    .then(factory => {
      const Module = factory();
      console.log(Module);
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
    ModelFactory.clearModels();

    Object.keys(__non_webpack_require__.cache).forEach(k => {
      console.log("deleting cached module", k);
      delete __non_webpack_require__.cache[k];
    });
  }

  function start(router) {
    const label = "\ntotal time to import & register remote modules";
    console.time(label);

    const overrides = { save, find, Persistence };

    getRemoteModules.then(initRemotes => {
      initRemotes(overrides).then(() => {
        const cache = initCache();

        make(ENDPOINT, router, "post", postModels);
        make(ENDPOINT, router, "get", getModels);
        make(ENDPOINTID, router, "get", getModelsById);
        make(ENDPOINTID, router, "patch", patchModels);
        make(ENDPOINTCMD, router, "patch", patchModels);
        make(ENDPOINTID, router, "delete", deleteModels);

        console.timeEnd(label);

        makeAdmin(ENDPOINT, router, http);

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
