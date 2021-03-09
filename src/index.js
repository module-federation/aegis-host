"use strict";
const express = require("express");
const app = express();
const remoteEntry = require("./remoteEntry");
require("regenerator-runtime");
const PORT = 8070;

function startMicroLib(remoteEntry, app) {
  remoteEntry.microlib.get("./server").then(factory => {
    const Module = factory();
    Module.default.start(app);
  });
}

app.use(express.json());
app.use(express.static("public"));

startMicroLib(remoteEntry, app);

app.get("/restart", (req, res) => {
  Object.keys(require.cache)
    .filter(k => /remoteEntry/.test(k))
    .forEach(k => {
      console.log("deleting module: ", k);
      delete require.cache[k];
    });
  
  res.send("{ status: 'reloading...' }");
  const remoteEntry = require("./remoteEntry");
  startMicroLib(remoteEntry, app);
  res.end();
});

app.listen(PORT, function () {
  console.log(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
});
