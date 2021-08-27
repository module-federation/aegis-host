/**
 * @typedef {import("./remote-entries-type")} entry
 */

/**
 * @type {entry}
 */
const entries = [
  {
    name: "microservices",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "customer2",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/models"),
  },
  {
    name: "adapters",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "customer2",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("microservices/adapters"),
  },
  {
    name: "services",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "customer2",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
];
