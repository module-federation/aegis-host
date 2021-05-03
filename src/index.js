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

const port = process.env.PORT || 8707;
const sslPort = process.env.SSL_PORT || 8070;
const apiRoot = process.env.API_ROOT || "/microlib/api";
const reloadPath = process.env.RELOAD_PATH || "/microlib/reload";
const sslEnabled = /true/i.test(process.env.SSL_ENABLED);
const serverless = /true/i.test(process.env.SERVERLESS);
const clusterEnabled = /true/i.test(process.env.CLUSTER_ENABLED);
let serviceStarted = false;

// enable authorization
const app = authorization(express(), "/microlib");

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
  await serverModule.default.start(app);
  return serverModule.default.controller;
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
async function startService() {
  try {
    await startMicroLib();
    app.use(express.json());
    app.use(express.static("public"));
    reloadCallback();
    if (!serverless) startWebServer();
  } catch (e) {
    console.error(e);
  }
}

if (!serverless) {
  if (clusterEnabled) {
    cluster.startCluster(startService);
  } else {
    startService();
  }
}

const res = {
  send(data) {
    console.log("send", data);
    return data;
  },
  status(num) {
    console.log("status", num);
    return this;
  },
  set(data) {
    console.log("set", data);
  },
  headers: {},
  type: data => console.log(data),
};

const serverlessAdapter = {
  controller: null,

  parsers: {
    aws: args => ({ req: { ...args }, res }),
    azure: args => ({ req: { ...args }, res }),
    google: args => ({ req: { ...args }, res }),
    ibm: args => ({ req: { ...args }, res }),
  },

  parsePayload(...args) {
    console.debug({ name: this.parsePayload.name, args });
    const parse = this.parsers.aws;

    if (typeof parse === "function") {
      const output = parse(...args);
      console.debug({ func: parse.name, output });
      return output;
    }
    console.warn("no parser found for provider", args.provider);
  },

  async getController() {
    /**
     * invokes the controller for a given route
     * @param  {...any} args
     */
    function invoke(...args) {
      const { req, res } = this.parsePayload(...args);
      this.controller(req.path, req.method, req, res);
    }

    if (this.controller) {
      return {
        invoke: invoke.bind(this),
      };
    }

    this.controller = await startMicroLib();
    await new Promise(resolve => setTimeout(resolve, 4000));

    return {
      invoke: invoke.bind(this),
    };
  },
};

exports.handleServerlessRequest = async function (...args) {
  console.info("serverless mode initializing", args);
  const controller = await serverlessAdapter.getController();
  return controller.invoke(...args);
};
