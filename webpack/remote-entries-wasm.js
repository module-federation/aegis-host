const { importWebAssembly } = require("@module-federation/aegis/lib/adapters/webassembly/import-wasm");
const order = require("./remote-entries-order");

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
      return importWebAssembly(this, "model");
    }
  },
].concat(order);
