
module.exports = [
  {
    name: "distributed-cache",
    url: "http://aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "model-cache",
    importRemote: async () =>
      Object.values((await import("distributed-cache/model-cache")).models),
  },
  {
    name: "adapter-cache",
    url: "http:/aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "adapter-cache",
    importRemote: async () => Object.values(await import("distributed-cache/adapter-cache")),
  },
  {
    name: "service-cache",
    url: "http://aegis.module-federation.org:8060/remoteEntry.js",
    path: __dirname,
    type: "service-cache",
    importRemote: async () => Object.values(await import("distributed-cache/service-cache")),
  },
]

