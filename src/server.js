"use strict";

require("regenerator-runtime");

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

const Server = (() => {
  const port = process.env.PORT || "8070";
  const sslPort = process.env.SSL_PORT || "8707";
  const apiRoot = process.env.API_ROOT || "/microlib/api";
  const modelPath = `${apiRoot}/models`;
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
  }

  function make(path, app, method, controllers) {
    controllers().forEach(ctlr => {
      console.info(ctlr);
      app[method](path(ctlr.endpoint), http(ctlr.fn));
    });
  }

  function clear() {
    try {
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

    getRemoteEntries.then(remotes => {
      getRemoteModules.then(initRemotes => {
        initRemotes(overrides, remotes).then(() => {
          const cache = initCache();

          make(endpoint, router, "post", postModels);
          make(endpoint, router, "get", getModels);
          make(endpointId, router, "get", getModelsById);
          make(endpointId, router, "patch", patchModels);
          make(endpointCmd, router, "patch", patchModels);
          make(endpointId, router, "delete", deleteModels);

          console.timeEnd(label);
          makeAdmin(router, http);
          cache.load();

          console.log(`http://localhost:${port}`);
          console.log(`https://localhost:${sslPort}`);
          process.on("SIGTERM", () => close());
        });
      });
    });
  }

  return {
    clear,
    start,
  };
})();

export default Server;
