const { importWebAssembly } = require("@module-federation/aegis/lib/adapters/webassembly/import-wasm");

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
    importRemote() {
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
    importRemote: async () => Object.values((await import("microservices/domain")).models),
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
