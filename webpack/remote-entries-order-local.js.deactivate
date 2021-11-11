
module.exports = [
  {
    name: "microservices",
    url: "http://aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/models"),
  },
  {
    name: "adapters",
    url: "http:/aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("microservices/adapters"),
  },
  {
    name: "services",
    url: "http://aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
]


