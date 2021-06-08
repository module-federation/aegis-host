module.exports = [
  {
    name: "distributed-cache",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "model-cache",
    importRemote: async => import("distributed-cache/models-cache"),
  },
  {
    name: "adapters-cache",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter-cache",
    importRemote: async () => import("distributed-cache/adapters-cache"),
  },
  {
    name: "services-cache",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "service-cache",
    importRemote: async () => import("distributed-cache/services-cache"),
  },
];
