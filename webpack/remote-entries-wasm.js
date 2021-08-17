const { importWebAssembly } = require("@module-federation/aegis/lib/adapters/webassembly");

module.exports = [
  {
    name: "wasm",
    url: "https://api.github.com",
    repo: "assembly",
    owner: "tysonrm",
    filedir: "build",
    branch: "master",
    path: __dirname,
    type: "model",
    wasm: true,
    async importRemote() {
      return importWebAssembly(this);
    }
  },
  {
    name: "microservices",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "master",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/domain"),
  },
  {
    name: "adapters",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "master",
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
    branch: "master",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
];
