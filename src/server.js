"use strict";

import express from "express";
import bodyParser from "body-parser";

import {
  postModels,
  patchModels,
  getModels,
  getModelsById,
  deleteModels,
} from "./controllers";

import { initRemotes } from "./models";
import { Persistence } from "./services/persistence-service";
import { save, find, update, close } from "./adapters/persistence-adapter";
import adapter from "./adapters/http-adapter";
import initMiddleware from "./middleware";
import log from "./lib/logger";

const Server = (() => {
  const app = express();
  const API_ROOT = "/api";
  const PORT = 8070;
  const ENDPOINT = (e) => `${API_ROOT}/${e}`;
  const ENDPOINTID = (e) => `${API_ROOT}/${e}/:id`;

  app.use(bodyParser.json());
  app.use(express.static("public"));

  function make(path, app, method, controllers) {
    controllers().forEach((ctlr) => {
      log(ctlr);
      app[method](path(ctlr.endpoint), adapter(ctlr.fn));
    });
  }

  function run() {
    const importStartTime = Date.now();
    const overrides = { save, find, update, Persistence };

    initRemotes(overrides).then(() => {
      log("\n%dms to import & register models\n", Date.now() - importStartTime);

      const makeEPStartTime = Date.now();

      make(ENDPOINT, app, "post", postModels);
      make(ENDPOINT, app, "get", getModels);
      make(ENDPOINTID, app, "patch", patchModels);
      make(ENDPOINTID, app, "get", getModelsById);
      make(ENDPOINTID, app, "delete", deleteModels);

      log("\n%dms to create endpoints\n", Date.now() - makeEPStartTime);

      app.listen(PORT, function () {
        console.log(`Server listening on http://localhost:${PORT}`);
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
