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

import { initRemotes } from "./models";
import { Persistence } from "./services/persistence-service";
import { save, find, close } from "./adapters/persistence-adapter";
import http from "./adapters/http-adapter";


const Server = (() => {
    const getInitiRemotes = __non_webpack_require__("./remoteEntry")
        .microlib.get("./models")
        .then(factory => {
          const Module = factory();
          console.log(Module)
          return Module.initRemotes
        });

  const API_ROOT = "/api";
  const PORT = 8070;
  const ENDPOINT = e => `${API_ROOT}/${e}`;
  const ENDPOINTID = e => `${API_ROOT}/${e}/:id`;
  const ENDPOINTCMD = e => `${API_ROOT}/${e}/:id/:command`;

  function makeAdmin(path, app, adapter) {
    app.get(path("config"), adapter(getConfig()));
  }

  function make(path, app, method, controllers) {
    controllers().forEach(ctlr => {
      console.info(ctlr);
      app[method](path(ctlr.endpoint), http(ctlr.fn));
    });
  }

  function run(router) {
    const label = "\ntotal time to import & register remote modules";
    console.time(label);

    const overrides = { save, find, Persistence };

    getInitiRemotes.then((initRemotes)=>{
      console.log(initRemotes)
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
    })

  }

  // function start() {
  //   initMiddleware(app, API_ROOT, run);
  // }

  return {
    start: run,
  };
})();

export default Server;
