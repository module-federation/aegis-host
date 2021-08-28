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
      return importWebAssembly(this, "model");
    }
  },
  // {
  //   name: "wasm",
  //   url: "https://aegis.module-federation.org:8060/",
  //   path: __dirname,
  //   type: "model",
  //   wasm: true,
  //   importRemote() {
  //     return importWebAssembly(this, "model");
  //   }
  // },

]
