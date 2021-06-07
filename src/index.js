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
const authorization = require("./auth");
const messageParser = require("./message").parsers;
const { ServerlessAdapter } = require("./serverless-adapter");
const StaticFileHandler = require("serverless-aws-static-file-handler");

const port = process.argv[2] ? process.argv[2] : process.env.PORT || 8070;
const sslPort = process.env.SSL_PORT || 8071;
const apiRoot = process.env.API_ROOT || "/microlib/api";
const reloadPath = process.env.RELOAD_PATH || "/microlib/reload";
const sslEnabled = /true/i.test(process.env.SSL_ENABLED);
const cloudProvider = process.env.CLOUD_PROVIDER;
const clusterEnabled = /true/i.test(process.env.CLUSTER_ENABLED);

// enable authorization
const app = authorization(express(), "/microlib");

function isServerless() {
  return (
    /serverless/i.test(process.title) || /true/i.test(process.env.SERVERLESS)
  );
}

/**
 * Callbacks attached to existing routes are stale.
 * Clear the routes we need to update.
 */
function clearRoutes() {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path && k.route.path.startsWith(apiRoot))
  );
}

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
    // clear stale routes
    clearRoutes();
    // clear cache on hot reload
    serverModule.default.clear();
  }
  await serverModule.default.start(app);
  return serverModule.default.control;
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
      await startMicroLib({ hot: true });
      res.send("<h1>hot reload complete</h1>");
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 *
 * @param {*} provider
 * @param {*} messages
 */
function checkPublicIpAddress() {
  const bytes = [];
  const proto = sslEnabled ? "https" : "http";
  const p = sslEnabled ? sslPort : port;

  if (/local/i.test(process.env.NODE_ENV)) {
    const ipAddr = "localhost";
    console.log(`\n 🌎 ÆGIS listening on ${proto}://${ipAddr}:${p} \n`);
    return;
  }
  http.get(
    {
      hostname: "checkip.amazonaws.com",
      method: "get",
    },
    function (response) {
      response.on("data", chunk => bytes.push(chunk));
      response.on("end", function () {
        const ipAddr = bytes.join("").trim();
        console.log(`\n 🌎 ÆGIS listening on ${proto}://${ipAddr}:${p} \n`);
      });
    }
  );
}

/**
 * Start web server, optionally require secure socket.
 */
async function startWebServer() {
  if (sslEnabled) {
    const key = fs.readFileSync("cert/server.key", "utf8");
    const cert = fs.readFileSync("cert/domain.crt", "utf8");
    const httpsServer = https.createServer({ key, cert }, app);
    app.use(graceful(httpsServer, { logger: console, forceTimeout: 30000 }));
    httpsServer.listen(sslPort, checkPublicIpAddress);
  } else {
    const httpServer = http.createServer(app);
    app.use(graceful(httpServer, { logger: console, forceTimeout: 30000 }));
    httpServer.listen(port, checkPublicIpAddress);
  }
}

/**
 * Handle options and start the server.
 * Options:
 * https or http,
 * authorization (via jwt and a\
 * uth0) enabled or disabled
 * clustered or single process,
 * hot reload via rolling restart or deleting cache
 */
async function startService() {
  try {
    app.use(express.json());
    app.use(express.static("public"));
    await startMicroLib();
    reloadCallback();
    startWebServer();
  } catch (e) {
    console.error(e);
  }
}

if (!isServerless()) {
  if (clusterEnabled) {
    cluster.startCluster(startService);
  } else {
    startService();
  }
}

let serverlessAdapter = null;

/**
 * Serverless entry point - called by the serverless function.
 * @param  {...any} args arguments passsed to serverless function
 */
exports.handleServerlessRequest = async function (...args) {
  console.info("running in serverless mode", args);

  if (!serverlessAdapter) {
    serverlessAdapter = await ServerlessAdapter(
      startMicroLib,
      cloudProvider,
      messageParser
    );
  }

  return serverlessAdapter.invokeController(...args);
};

const fileHandler = new StaticFileHandler("public");
/**
 * Serve static files, i.e. the demo app.
 * @param {*} event
 * @param {*} context
 * @returns
 */
exports.serveHtml = async (event, context) => {
  console.debug({ event, context });
  console.log(event.path);
  event.path = "index.html";
  return fileHandler.get(event, context);
};
