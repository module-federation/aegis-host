module.exports = [
  {
    name: "microservices",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "model",
    importRemote: async () => {
      const models = await import("microservices/models");
      return models.models;
    },
  },
  {
    name: "adapters",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter",
    importRemote: async () => {
      const adapters = await import("microservices/adapters");
      return adapters;
    },
  },
  {
    name: "services",
    url: "http://localhost:8060/remoteEntry.js",
    path: __dirname,
    type: "service",
    importRemote: async () => {
      const services = await import("microservices/services");
      return services;
    },
  },
];
