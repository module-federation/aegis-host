"use strict";

const cluster = require("cluster");
const numCores = require("os").cpus().length;
let reloading = false;
let reloadList = [];

function startWorker() {
  const worker = cluster.fork();

  worker.on("message", function (message) {
    if (message?.cmd && message.cmd === "reload") {
      console.log("reload requested");
      if (reloading) {
        console.log("reload already in progress");
        return;
      }
      reloading = true;
      reloadList = Object.values(cluster.workers);
      worker.send({ cmd: "shutdown" });
    }
  });

  worker.on("exit", function () {
    console.log("worker down");
    if (reloading) {
      reloadList.pop();
      if (reloadList.length > 0) {
        startWorker();
        return;
      }
      reloading = false;
    }
  });

  worker.on("online", function () {
    console.log("worker up");
    if (reloading) {
      if (reloadList.length > 0) {
        worker.send({ cmd: "shutdown" });
      }
    }
  });
}

module.exports.startCluster = function (startService, app) {
  if (cluster.isMaster) {
    console.log(`master starting ${numCores} workers`);
    for (let i = 0; i < numCores; i++) {
      startWorker();
    }
  } else {
    process.on("message", function (message) {
      if (message?.cmd && message.cmd === "shutdown") {
        console.log("stopping", cluster.worker.process.pid);
        cluster.worker.kill("SIGTERM");
      }
    });

    startService(app);
  }
};
