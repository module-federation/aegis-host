"use strict";

const express = require("express");
const app = express();
require("regenerator-runtime");
const importFresh = require("import-fresh");
const clearModule = require("clear-module");
const PORT = 8070;

async function startMicroLib(app, hot = false) {
  const remoteEntry = importFresh("./remoteEntry");
  const factory = await remoteEntry.microlib.get("./server");
  const serverModule = factory();
  if (hot) {
    serverModule.default.clear();
  }
  serverModule.default.start(app);
}

startMicroLib(app).then(() => {
  app.use(express.json());
  app.use(express.static("public"));
  app.listen(PORT, function () {
    console.log(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
  });
});

app.get("/restart", (req, res) => {
  clearModule.all();
  res.send("<h1>hot reload of federated modules...<h1>");
  startMicroLib(app, true);
});
