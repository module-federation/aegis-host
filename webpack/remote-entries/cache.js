exports.cache = [
  {
    name: 'distributed-cache',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'cache',
    path: __dirname,
    type: 'model-cache',
    importRemote: async () => import('distributed-cache/model-cache')
  },
  {
    name: 'adapter-cache',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'cache',
    path: __dirname,
    type: 'adapter-cache',
    importRemote: async () => import('distributed-cache/adapter-cache')
  },
  {
    name: 'service-cache',
    url: 'https://api.github.com',
    repo: 'aegis-application',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'cache',
    path: __dirname,
    type: 'service-cache',
    importRemote: async () => import('distributed-cache/service-cache')
  }
]
