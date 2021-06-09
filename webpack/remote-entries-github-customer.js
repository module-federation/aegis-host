module.exports = [
  {
    name: "microservices",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=customer-server",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/models"),
  },
  {
    name: "adapters",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=customer-server",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("microservices/adapters"),
  },
  {
    name: "services",
    url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=customer-server",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
];
