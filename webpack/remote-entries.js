const githubEntries = require("./remote-entries-github");
//const localEntries = require("./remote-entries-local");
const localEntries = [];
module.exports = githubEntries.concat(localEntries);

// [
//   {
//     name: "microservices",
//     url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
//     path: __dirname,
//     type: "model",
//     importRemote: async () => import("microservices/models"),
//   },
//   {
//     name: "adapters",
//     url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
//     path: __dirname,
//     type: "adapter",
//     importRemote: async () => import("microservices/adapters"),
//   },
//   {
//     name: "services",
//     url: "https://api.github.com/repos/module-federation/MicroLib-Example/contents/dist?ref=master",
//     path: __dirname,
//     type: "service",
//     importRemote: async () => import("microservices/services"),
//   },
//   {
//     name: "distributed-cache",
//     url: "http://localhost:8060/remoteEntry.js",
//     path: __dirname,
//     type: "model-cache",
//     importRemote: async () => import("distributed-cache/models"),
//   },
//   {
//     name: "adapters-cache",
//     url: "http://localhost:8060/remoteEntry.js",
//     path: __dirname,
//     type: "adapter-cache",
//     importRemote: async () => import("distributed-cache/adapters"),
//   },
//   {
//     name: "services-cache",
//     url: "http://localhost:8060/remoteEntry.js",
//     path: __dirname,
//     type: "service-cache",
//     importRemote: async () => import("distributed-cache/services"),
//   },
// ];
