"use strict";
const express = require("express");
const app = express();
require("regenerator-runtime");
const PORT = 8070;
const importFresh = require("import-fresh");

function startMicroLib(app) {
  importFresh("./remoteEntry")
    .microlib.get("./server")
    .then(factory => {
      const Module = factory();
      Module.default.start(app);
    });
}

app.use(express.json());
app.use(express.static("public"));
startMicroLib(app);

app.get("/restart", (req, res) => {
  // Object.keys(require.cache)
  //   .filter(k => /remoteEntry/.test(k))
  //   .forEach(k => {
  //     console.log("deleting module: ", k);
  //     delete require.cache[k];
  //   });

  res.send("hot reload of federated models...");
  startMicroLib(app);
  res.end();
});

app.listen(PORT, function () {
  console.log(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
});
