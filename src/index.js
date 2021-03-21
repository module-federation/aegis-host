"use strict";

require("dotenv").config();
require("regenerator-runtime");
const cluster = require("cluster");
const importFresh = require("import-fresh");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = require("./auth")(express(), "/microlib");
const privateKey = fs.readFileSync("cert/server.key", "utf8");
const certificate = fs.readFileSync("cert/domain.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };
const clusterEnabled = process.env.CLUSTER_ENABLED || false;
const port = process.env.PORT || 8070;
const sslEnabled = process.env.SSL_ENABLED || true;
const sslPort = process.env.SSL_PORT || 8707;
const apiRoot = process.env.API_ROOT || "/microlib/api";
const reloadPath = process.env.RELOAD_PATH || "/microlib/reload";
const workers = [];

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

function reloadCallback() {
  if (clusterEnabled) {
    return async function reloadCluster(req, res) {
      res.send("<h1>starting cluster reload</h1>");
      //process.send("request cluster reload");
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

/**
 * @todo Send a message to master process to do a rolling restart
 * @param {*} req
 * @param {*} res
 */

function startService() {
  /**
   * Run either http or https,
   * see .env var SSL_ENABLED
   */
  startMicroLib().then(() => {
    app.use(express.json());
    app.use(express.static("public"));
    app.use(reloadPath, reloadCallback());
    const httpsServer = https.createServer(credentials, app);
    const httpServer = http.createServer(app);

    if (sslEnabled) {
      httpsServer.listen(sslPort, () => {
        console.info(
          `\nMicroLib listening on secure port https://localhost:${sslPort} 🌎\n`
        );
      });
      return;
    }

    httpServer.listen(port, () => {
      console.info(
        `\nMicroLib listening on port https://localhost:${port} 🌎\n`
      );
    });
  });
}

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
function setupWorkerProcesses() {
  // to read number of cores on system
  let numCores = require("os").cpus().length;
  console.log("Master cluster setting up " + numCores + " workers");

  // iterate on number of cores need to be utilized by an application
  // current example will utilize all of them
  for (let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    workers.push(cluster.fork());

    // to receive messages from worker process
    workers[i].on("message", function (message) {
      console.log(message);
    });
  }

  // process is clustered on a core and process id is assigned
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is listening");
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " died with code: " +
        code +
        ", and signal: " +
        signal
    );
    console.log("Starting a new worker");
    cluster.fork();
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[workers.length - 1].on("message", function (message) {
      console.log(message);
    });
  });
}

/**
 * Setup server either with clustering or without it
= * @constructor
 */
function setupServer() {
  // if it is a master process then call setting up worker process
  if (clusterEnabled && cluster.isMaster) {
    setupWorkerProcesses();
  } else {
    // to setup server configurations and share port address for incoming requests
    startService();
  }
}

setupServer();
