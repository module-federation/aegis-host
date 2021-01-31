"use strict";

import express from "express";
import bodyParser from "body-parser";

import {
  postModels,
  patchModels,
  getModels,
  getModelsById,
  deleteModels,
  initCache,
} from "./controllers";

import { initRemotes } from "./models";
import { Persistence } from "./services/persistence-service";
import { save, find, close } from "./adapters/persistence-adapter";
import http from "./adapters/http-adapter";
import initMiddleware from "./middleware";

const Server = (() => {
  const app = express();
  const API_ROOT = "/api";
  const PORT = 8070;
  const ENDPOINT = e => `${API_ROOT}/${e}`;
  const ENDPOINTID = e => `${API_ROOT}/${e}/:id`;
  const ENDPOINTCMD = e => `${API_ROOT}/${e}/:id/:command`;

  app.use(bodyParser.json());
  app.use(express.static("public"));

  function make(path, app, method, controllers) {
    controllers().forEach(ctlr => {
      console.log(ctlr);
      app[method](path(ctlr.endpoint), http(ctlr.fn));
    });
  }

  function run() {
    const label = "\ntotal time to import & register remote modules";
    console.time(label);

    const overrides = { save, find, Persistence };

    initRemotes(overrides).then(() => {
      const cache = initCache();

      make(ENDPOINT, app, "post", postModels);
      make(ENDPOINT, app, "get", getModels);
      make(ENDPOINTID, app, "get", getModelsById);
      make(ENDPOINTID, app, "patch", patchModels);
      make(ENDPOINTCMD, app, "patch", patchModels);
      make(ENDPOINTID, app, "delete", deleteModels);

      console.timeEnd(label);

      cache.load();

      app.listen(PORT, function () {
        console.log(`\nServer listening on http://localhost:${PORT}`);
      });

      process.on("SIGTERM", () => close());
    });
  }

  function start() {
    initMiddleware(app, API_ROOT, run);
  }

  return {
    start,
  };
})();

export default Server;
