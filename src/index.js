"use strict";

require("dotenv").config();
require("regenerator-runtime");
const importFresh = require("import-fresh");
const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const cluster = require("./cluster");
const graceful = require("express-graceful-shutdown");

const port = process.env.PORT || 8707;
const sslPort = process.env.SSL_PORT || 8070;
const apiRoot = process.env.API_ROOT || "/microlib/api";
const reloadPath = process.env.RELOAD_PATH || "/microlib/reload";
const sslEnabled = /true/i.test(process.env.SSL_ENABLED);
const clusterEnabled = /true/i.test(process.env.CLUSTER_ENABLED);

// Optionally enable authorization
const app = require("./auth")(express(), "/microlib");

/**
 * Load federated server module. Call `clear` to delete non-webpack cache if
 * hot reloading. Call `start` to import remote models, adapters, services,
 * set API routes and load persisted data from storage.
 *
 * @param {boolean} hot `true` to hot reload
 */
async function startMicroLib({ hot = false } = {}) {
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
 */
function reloadCallback() {
  // Manual reset if left in wrong stated
  app.use(`${reloadPath}-reset`, function (req, res) {
    process.send({ cmd: "reload-reset" });
    res.send("reload status reset...try again");
  });

  if (clusterEnabled) {
    app.use(reloadPath, async function (req, res) {
      res.send("<h1>starting cluster reload</h1>");
      process.send({ cmd: "reload" });
    });
    return;
  }

  app.use(reloadPath, async function (req, res) {
    try {
      clearRoutes();
      await startMicroLib({ hot: true });
      res.send("<h1>hot reload complete</h1>");
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * Start web server, optionally require secure socket.
 */
function startWebServer() {
  if (sslEnabled) {
    const key = fs.readFileSync("cert/server.key", "utf8");
    const cert = fs.readFileSync("cert/domain.crt", "utf8");
    const httpsServer = https.createServer({ key, cert }, app);
    app.use(graceful(httpsServer, { logger: console, forceTimeout: 30000 }));

    httpsServer.listen(sslPort, function () {
      console.info(`\n🌎 https://localhost:${sslPort} 🌎\n`);
    });
    return;
  }
  const httpServer = http.createServer(app);
  app.use(graceful(httpServer, { logger: console, forceTimeout: 30000 }));

  httpServer.listen(port, function () {
    console.info(`\n🌎 https://localhost:${port} 🌎\n`);
  });
}

/**
 * Handle options and start the server.
 * Options:
 * https or http,
 * authorization (via jwt and auth0) enabled or disabled
 * clustered or single process,
 * hot reload via rolling restart or deleting cache
 */
function startService() {
  startMicroLib().then(() => {
    app.use(express.json());
    app.use(express.static("public"));
    reloadCallback();
    startWebServer();
  });
}

if (clusterEnabled) {
  cluster.startCluster(startService);
} else {
  startService();
}
