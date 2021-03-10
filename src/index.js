"use strict";
const express = require("express");
const app = express();
require("regenerator-runtime");
const importFresh = require("import-fresh");
const PORT = 8070;

async function startMicroLib(app) {
  const remoteEntry = importFresh("./remoteEntry");
  const factory = await remoteEntry.microlib.get("./server");
  const serverModule = factory();
  serverModule.default.start(app);
}

//app.use(express.json());
//app.use(express.static("public"));
startMicroLib(app).then(() => {
  app.use(express.json());
  app.use(express.static("public"));
});

app.get("/restart", (req, res) => {
  Object.keys(require.cache)
    .filter(k => /remoteEntry/.test(k))
    .forEach(k => {
      console.log("deleting module: ", k);
      delete require.cache[k];
    });

  res.send("hot reload of federated models...");
  startMicroLib(app);
  res.end();
});

app.listen(PORT, function () {
  console.log(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
});
