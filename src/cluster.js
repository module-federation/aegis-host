"use strict";

const cluster = require("cluster");
const workers = [];

const clusterActions = {
  reload: async () => {
    workers.forEach(w => {});
  },
  resetCacheLimit (increase) {
    
  }

};

function messageHandler(message) {
  if (clusterActions[message]) {
    try {
      await clusterActions[message]();
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
function startWorkers() {
  // to read number of cores on system
  const numCores = require("os").cpus().length;
  console.log(`Master cluster setting up ${numCores} workers`);

  // iterate on number of cores need to be utilized by an application
  // current example will utilize all of them
  for (let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    workers.push(cluster.fork());

    // to receive messages from worker process
    workers[i].on("message", messageHandler);
  }

  // process is clustered on a core and process id is assigned
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is listening");
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on("exit", function (worker, code, signal) {
    console.log(
      `Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`
    );
    console.log("Starting a new worker");
    //  cluster.fork();
    //workers.push(cluster.fork());

    // to receive messages from worker process
    workers[workers.length - 1].on("message", function (message) {
      console.log(message);
    });
  });
}

/**
 * Setup server either with clustering or without it
 */
module.exports.startCluster = function (startServer, app) {
  if (cluster.isMaster) {
    startWorkers();
  } else {
    startServer(app);
  }
};
