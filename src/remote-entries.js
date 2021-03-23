require("regenerator-runtime");

module.exports = [
  {
    name: "orderService",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "model",
    importRemote: async () => {
      const models = await import("orderService/models");
      return models;
    },
  },
  {
    name: "adapters",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter",
    importRemote: async () => {
      const adapters = await import("orderService/adapters");
      return adapters;
    },
  },
  {
    name: "services",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "service",
    importRemote: async () => {
      const services = await import("orderService/services");
      return services;
    },
  },
];
