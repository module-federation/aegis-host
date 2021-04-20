module.exports = [
  {
    name: "microservices",
    url:
      "https://raw.githubusercontent.com/module-federation/MicroLib-Example/oldstyle-stream/dist/",
    path: __dirname,
    type: "model",
    importRemote: async () => {
      const models = await import("microservices/models");
      return models.models;
    },
  },
  {
    name: "adapters",
    url:
      "https://raw.githubusercontent.com/module-federation/MicroLib-Example/oldstyle-stream/dist/",
    path: __dirname,
    type: "adapter",
    importRemote: async () => {
      const adapters = await import("microservices/adapters");
      return adapters;
    },
  },
  {
    name: "services",
    url:
      "https://raw.githubusercontent.com/module-federation/MicroLib-Example/oldstyle-stream/dist/",
    path: __dirname,
    type: "service",
    importRemote: async () => {
      const services = await import("microservices/services");
      return services;
    },
  },
];
