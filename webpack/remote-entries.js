
module.exports = [
  {
    name: 'fedmonserv',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    importRemote: async () => {
      const models = await import('fedmonserv/models');
      return models;
    }
  },
]