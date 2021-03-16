"use strict";

require("regenerator-runtime");
const importFresh = require("import-fresh");
const express = require("express");
const app = express();
const port = process.env.PORT || 8070;

/**
 * Load federated server module. Call `clear` to delete non-webpack cache if
 * hot reloading. Call `start` to import remote models, adapters, services,
 * set API routes and load persisted data from storage.
 * @param {boolean} hot `true` to hot reload
 */
async function startMicroLib(hot = false) {
  const remoteEntry = importFresh("./remoteEntry");
  const factory = await remoteEntry.microlib.get("./server");
  const serverModule = factory();
  if (hot) {
    serverModule.default.clear();
  }
  serverModule.default.start(app);
}

/**
 * Callbacks attached to existing routes are stale.
 * Clear the routes we need to update.
 */
function clearRoutes() {
  app._router.stack = app._router.stack.filter(
    k => !(k?.route?.path && k.route.path.startsWith("/api"))
  );
}

/**
 * Initial startup
 */
startMicroLib().then(() => {
  app.use(express.json());
  app.use(express.static("public"));
  app.listen(port, function () {
    console.info(`\n🌎 MicroLib listening on http://localhost:${port} 🌎\n`);
  });
});

/**
 * Trigger a hot reload:
 * clear routes,
 * reimport server & remotes
 * clear non-webpack cache.
 */
app.get("/reload", async (req, res) => {
  try {
    clearRoutes();
    await startMicroLib(true);
    res.send("<h1>hot reload complete</h1>");
  } catch (error) {
    console.error(error);
  }
});
