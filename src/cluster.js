"use strict";

const cluster = require("cluster");
const numCores = require("os").cpus().length;
let reloading = false;
let reloadList = [];
let workerList = [];

/**
 * Start a new work and listern
 * @param {object[]} list workers
 */
function startWorker(list) {
  const worker = cluster.fork();

  worker.on("message", function (message) {
    if (message.cmd === "reload") {
      console.log("reload requested");
      if (reloading) {
        console.log("reload already in progress");
        return;
      }
      reloading = true;
      reloadList = [...workerList];
      workerList = [];
      const worker = reloadList.pop();
      worker.kill("SIGTERM");
    }
  });

  workerList.push(worker);
}

/**
 * Gracefully stop a worker on the reload list.
 */
function stopWorker() {
  const worker = reloadList.pop();
  worker.kill("SIGTERM");
}

/**
 * Checks status of reload
 * @returns {boolean} true to continue, otherwise stop
 */
function continueReload() {
  const yes = reloading === true && reloadList.length > 0;
  if (!yes) reloading = false;
  return yes;
}

module.exports.startCluster = function (startService, app) {
  if (cluster.isMaster) {
    /**
     * Worker stopped. If reloading, start a new one.
     */
    cluster.on("exit", function () {
      console.log("worker down");
      if (continueReload()) {
        startWorker();
      }
    });

    /**
     * Worker started. If reloading, stop the next one.
     */
    cluster.on("online", function () {
      console.log("worker up");
      if (continueReload()) {
        stopWorker();
      }
    });

    /**
     * In case of IPC channel closes. Resume reload.
     */
    process.on("uncaughtException", error => {
      console.error(error);
      if (continueReload()) {
        startWorker();
      }
    });

    console.log(`master starting ${numCores} workers`);

    for (let i = 0; i < numCores; i++) {
      startWorker();
    }
  } else {
    startService(app);
  }
};
