"use strict";

const express = require("express");
const app = express();
require("regenerator-runtime");
const importFresh = require("import-fresh");
const port = process.env.PORT || 8070;

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
  app.listen(port, function () {
    console.log(`\n🌎 MicroLib listening on http://localhost:${port} 🌎\n`);
  });
});

app.get("/reload", (req, res) => {
  app._router.stack = app._router.stack.filter(
    k => !(k?.route?.path && k.route.path.startsWith("/api"))
  );
  res.send("<h1>hot reload of federated modules...</h1>");
  startMicroLib(app, true);
});
