const order = require("./remote-entries-order");

module.exports = [
  {
    name: "distributed-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.js",
    path: __dirname,
    type: "model-cache",
    importRemote: async () => Object.values((await import("distributed-cache/domain")).models),
  },
  {
    name: "adapter-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter-cache",
    importRemote: async () => import("distributed-cache/adapter-cache"),
  },
  {
    name: "service-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.js",
    path: __dirname,
    type: "service-cache",
    importRemote: async () => import("distributed-cache/service-cache"),
  },
].concat(order);
