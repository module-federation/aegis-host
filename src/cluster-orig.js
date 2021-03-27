"use strict";

const totalCores = require("os").cpus().length;
const cluster = require("cluster");

const Status = {
  RELOADING: Symbol(),
  RUNNING: Symbol(),
};

const Cluster = {
  status: Status.RUNNING,
  lastRestart: 0,
  restartList: [],
  isReloading() {
    return this.status === Status.RELOADING;
  },
  totalWorkers() {
    return Object.keys(cluster.workers).length;
  },
  startWorker() {
    console.log("new worker request received...");
    // Don't start if we are reloading or there's no need
    if (this.totalWorkers() < totalCores) {
      console.log("starting new worker");
      // delay the restart so we don't thrash
      setTimeout(
        () => cluster.fork().on("listen", handleMessageFromWorker),
        10000
      );
      return;
    }
    console.log("sufficient number already running");
  },
  reloadWorker() {
    if (this.isReloading()) {
      const worker = this.restartList.pop();
      if (worker) {
        worker.send({ cmd: "shutdown" });
        return;
      }
    }
  },
  continueReload() {
    console.info({
      func: this.continueReload.name,
      desc: "checking if reload is needed",
    });
    if (this.isReloading()) {
      if (this.restartList.length > 0) {
        this.reloadWorker();
        return;
      }
      console.info("rolling restart complete");
      this.lastRestart = Date.now();
      this.status = Status.RUNNING;
    }
  },
  reload() {
    console.log("reload requested...");
    if (!this.isReloading()) {
      console.log("starting rolling restart...");
      this.status = Status.RELOADING;
      this.restartList = Object.values(cluster.workers);
      this.reloadWorker();
      return;
    }
    console.log("reload already in progress");
  },
  health() {
    console.log(
      JSON.parse(JSON.stringify({ ...this, totalWorkers: this.totalWorkers() }))
    );
  },
};

const handleMessageFromWorker = message =>
  message?.cmd && Cluster[message.cmd] ? Cluster[message.cmd]() : null;

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
function startWorkers() {
  console.log(`master starting ${totalCores} workers`);

  // Run a copy of this program on each core
  for (let i = 0; i < totalCores; i++) {
    cluster.fork().on("message", handleMessageFromWorker);
  }

  cluster.on("online", worker => console.log("worker up", worker.process.pid));
  cluster.on("exit", worker => console.log("worker down", worker.process.pid));
  cluster.on("online", () => Cluster.continueReload());
  cluster.on("exit", () => Cluster.startWorker());
}

const WorkerCommands = {
  shutdown() {
    console.log("SIGTERM shutdown");
    cluster.worker.kill("SIGTERM");
  },
  /**
   * @todo implement cache update to avoid miss
   */
  updateCache() {
    console.log("updating cache");
  },
};

const handleMessageFromMaster = message =>
  message?.cmd && WorkerCommands[message.cmd]
    ? WorkerCommands[message.cmd]()
    : null;

/**
 * Setup server either with clustering or without it
 */
module.exports.startCluster = function (startServer, app) {
  if (cluster.isMaster) {
    startWorkers();
  } else {
    process.on("message", handleMessageFromMaster);
    startServer(app);
  }
};
