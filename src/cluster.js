"use strict";

const cluster = require("cluster");
const numCores = require("os").cpus().length;
let reloading = false;
let reloadList = [];
let workerList = [];

/**
 * Start a new worker,
 * listen for a reload request from it,
 * add it to `workerList` which is used during the rolling restart.
 */
function startWorker() {
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
    // Worker stopped. If reloading, start a new one.
    cluster.on("exit", function () {
      console.log("worker down");
      if (continueReload()) {
        startWorker();
      }
    });

    // Worker started. If reloading, stop the next one.
    cluster.on("online", function () {
      console.log("worker up");
      if (continueReload()) {
        stopWorker();
      }
    });

    console.log(`master starting ${numCores} workers`);
    // Run a copy of this program on each core
    for (let i = 0; i < numCores; i++) {
      startWorker();
    }
  } else {
    // this is a worker, run the service.
    startService(app);
  }
};
