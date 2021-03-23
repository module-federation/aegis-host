"use strict";

require("dotenv").config();
require("regenerator-runtime");
const enabled = v => v === "true";
const importFresh = require("import-fresh");
const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const privateKey = fs.readFileSync("cert/server.key", "utf8");
const certificate = fs.readFileSync("cert/domain.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };
const port = process.env.PORT || 8070;
const sslPort = process.env.SSL_PORT || 8707;
const apiRoot = process.env.API_ROOT || "/microlib/api";
const reloadPath = process.env.RELOAD_PATH || "/microlib/reload";
const sslEnabled = enabled(process.env.SSL_ENABLED);
const clusterEnabled = enabled(process.env.CLUSTER_ENABLED);

// Optionally enable authorization
const app = require("./auth")(express(), "/microlib");

/**
 * Load federated server module. Call `clear` to delete non-webpack cache if
 * hot reloading. Call `start` to import remote models, adapters, services,
 * set API routes and load persisted data from storage.
 *
 * @param {boolean} hot `true` to hot reload
 */
async function startMicroLib(hot = false) {
  const remoteEntry = importFresh("./remoteEntry");
  const factory = await remoteEntry.microlib.get("./server");
  const serverModule = factory();

  if (hot) {
    // clear cache on hot reload
    serverModule.default.clear();
  }
  serverModule.default.start(app);
}

/**
 * Callbacks attached to existing routes are stale.
 * Clear the routes we need to update.
 */
function clearRoutes() {
  app._router.stack = app._router.stack.filter(
    k => !(k?.route?.path && k.route.path.startsWith(apiRoot))
  );
}

/**
 * Control hot reload differently depending on cluster mode.
 * @returns {function(req,res)} cluster or single proc reload
 */
function reloadCallback() {
  if (clusterEnabled) {
    return async function reloadCluster(req, res) {
      res.send("<h1>starting cluster reload</h1>");
    };
  }
  return async function reload(req, res) {
    try {
      clearRoutes();
      await startMicroLib(true);
      res.send("<h1>hot reload complete</h1>");
    } catch (error) {
      console.error(error);
    }
  };
}

/**
 * Handle options and start the server.
 * Options:
 * https or http,
 * authorization (via jwt and auth0) enabled or disabled
 * clustered (1 process per core) or single process,
 * hot reload via rolling restart or deleting cache
 */
function startService(app) {
  startMicroLib().then(() => {
    app.use(express.json());
    app.use(express.static("public"));
    app.use(reloadPath, reloadCallback());

    if (sslEnabled) {
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(sslPort, () => {
        console.info(
          `\nMicroLib listening on secure port https://localhost:${sslPort} 🌎\n`
        );
      });
      return;
    }

    const httpServer = http.createServer(app);
    httpServer.listen(port, () => {
      console.info(
        `\nMicroLib listening on port https://localhost:${port} 🌎\n`
      );
    });
  });
}

if (clusterEnabled) {
  require("./cluster").startCluster(startService, app);
} else {
  startService(app);
}
