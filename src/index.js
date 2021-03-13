"use strict";

require("regenerator-runtime");
const importFresh = require("import-fresh");
const express = require("express");
const app = express();
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

function clearExpressRoutes(app) {
  app._router.stack = app._router.stack.filter(
    k => !(k?.route?.path && k.route.path.startsWith("/api"))
  );
}

startMicroLib(app).then(() => {
  app.use(express.json());
  app.use(express.static("public"));
  app.listen(port, function () {
    console.info(`\n🌎 MicroLib listening on http://localhost:${port} 🌎\n`);
  });
});

app.get("/reload", async (req, res) => {
  try {
    clearExpressRoutes(app);
    await startMicroLib(app, true);
    res.send("<h1>hot reload complete</h1>");
  } catch (error) {
    console.error(error);
  }
});
