const order = require("./remote-entries-order");

module.exports = [
  {
    name: "distributed-cache",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "cache",
    path: __dirname,
    type: "model",
    importRemote: async () =>
      Object.values((await import("distributed-cache/models")).models),
  },
  {
    name: "adapter-cache",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "cache",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("distributed-cache/adapters"),
  },
  {
    name: "service-cache",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "cache",
    path: __dirname,
    type: "service",
    importRemote: async () => import("distributed-cache/services"),
  },
].concat(order);
