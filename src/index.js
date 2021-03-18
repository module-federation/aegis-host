"use strict";

require("regenerator-runtime");
require("dotenv").config();
const importFresh = require("import-fresh");
const express = require("express");
const { requiresAuth } = require("express-openid-connect");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();
const privateKey = fs.readFileSync("cert/key.pem", "utf8");
const certificate = fs.readFileSync("cert/server.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };
const port = process.env.PORT || 8070;
const sslPort = process.env.SSL_PORT || 8707;
const apiRoot = process.env.API_ROOT || "/microlib/api";

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
    // clear cache on hot deloy
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
 * Trigger a hot reload:
 * clear routes,d
 * reimport server & remotes
 * clear non-webpack cache.
 * @param {*} req
 * @param {*} res
 */
async function reload(req, res) {
  try {
    clearRoutes();
    await startMicroLib(true);
    res.send("<h1>hot reload complete</h1>");
  } catch (error) {
    console.error(error);
  }
}

// /**
//  * Get Auth0 user profile
//  * @param {*} req
//  * @param {*} res
//  */
// async function profile(req, res) {
//   res.send(JSON.stringify(req.oidc.user));
// }

/**
 * startup
 */
startMicroLib().then(() => {
  app.use(express.json());
  app.use(express.static("public"));
  app.get("reload", reload);
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  // listen on both ports
  httpServer.listen(port, () => {
    console.info(`\nMicroLib listening on http://localhost:${port} 🌎\n`);
  });

  httpsServer.listen(sslPort, () => {
    console.info(
      `\nMicroLib listening on secure port https://localhost:${sslPort} 🌎\n`
    );
  });
});
