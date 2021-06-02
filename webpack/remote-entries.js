module.exports = [
  {
    name: "microservices",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/models"),
  },
  {
    name: "adapters",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("microservices/adapters"),
  },
  {
    name: "services",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
  {
    name: "distributed-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.sh",
    path: __dirname,
    type: "model",
    importRemote: async () => import("distributed-cache/models"),
  },
  {
    name: "adapters-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.sh",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("distributed-cache/adapters"),
  },
  {
    name: "services-cache",
    url: "http://cache.aegis.dev:8060/remoteEntry.sh",
    path: __dirname,
    type: "service",
    importRemote: async () => import("distributed-cache/services"),
  },
];
