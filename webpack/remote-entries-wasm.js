const cache = require("./remote-entries-cache");

module.exports = [
  {
    name: "microservices",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "wasm",
    path: __dirname,
    type: "wasm",
    importRemote: async () => import("microservices/models"),
  },
].concat(cache);
