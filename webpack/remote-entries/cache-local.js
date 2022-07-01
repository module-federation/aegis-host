exports.cache = [
  {
    name: 'distributed-cache',
    url: 'http://localhost:8000',
    path: __dirname,
    type: 'model-cache',
    importRemote: async () => import('distributed-cache/model-cache')
  },
  {
    name: 'adapter-cache',
    url: 'http://localhost:8000',
    path: __dirname,
    type: 'adapter-cache',
    importRemote: async () => import('distributed-cache/adapter-cache')
  },
  {
    name: 'service-cache',
    url: 'http://localhost:8000',
    path: __dirname,
    type: 'service-cache',
    importRemote: async () => import('distributed-cache/service-cache')
  }
]
