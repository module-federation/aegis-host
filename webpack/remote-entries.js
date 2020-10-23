
module.exports = [
  {
    name: 'orderService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'model',
    importRemote: async () => {
      const models = await import('orderService/models');
      return models;
    }
  },
  {
    name: 'paymentService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => {
      const services = await import('orderService/paymentService');
      return services;
    }
  },
  {
    name: 'shippingService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => {
      const services = await import('orderService/shippingService');
      return services;
    }
  },
  {
    name: 'addressService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => {
      const services = await import('orderService/addressService');
      return services;
    }
  }
]