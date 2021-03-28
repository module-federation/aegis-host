"use strict";

const cluster = require("cluster");
const numCores = require("os").cpus().length;
let reloading = false;
let reloadList = [];
let loadedList = [];

/**
 * 
 * @param {object[]} list workers
 */
function startWorker(list) {
  const worker = cluster.fork();
  list.push(worker);
  worker.on("message", function (message) {
    try {
      if (message.cmd === "reload") {
        console.log("reload requested");
        if (reloading) {
          console.log("reload already in progress");
          return;
        }
        reloading = true;
        if (loadedList.length > 0) reloadList = [...loadedList];
        const worker = reloadList.pop();
        worker.send({ cmd: "shutdown" });
      }
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * 
 */
function checkReloadStatus() {
  try {
    if (reloading) {
      if (reloadList.length > 0) {
        startWorker(reloadList);
      }
      reloading = false;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports.startCluster = function (startService, app) {
  if (cluster.isMaster) {
    /**
     * Worker stopped. If reloading, start a new one.
     */
    cluster.on("exit", function () {
      try {
        console.log("worker down");
        if (reloading) {
          if (reloadList.length > 0) {
            startWorker(loadedList);
            return;
          }
          reloading = false;
        }
      } catch (error) {
        console.error(error);
      }
    });

    /**
     * Worker started. If reloading, stop the next one.
     */
    cluster.on("online", function () {
      console.log("worker up");
      try {
        if (reloading) {
          if (reloadList.length > 0) {
            const worker = reloadList.pop();
            worker.send({ cmd: "shutdown" });
          }
        }
      } catch (error) {
        console.error(error);
      }
    });

    /**
     * Intermmitent errors when IPC channel closes. Resume reload.
     */
    process.on("uncaughtException", error => {
      console.error(error);
      checkReloadStatus();
    });

    console.log(`master starting ${numCores} workers`);
    for (let i = 0; i < numCores; i++) {
      startWorker(reloadList);
    }
  } else {
    process.on("message", function (message) {
      if (message.cmd === "shutdown") {
        console.log("stopping", cluster.worker.process.pid);
        cluster.worker.kill("SIGTERM");
      }
    });

    startService(app);
  }
};
