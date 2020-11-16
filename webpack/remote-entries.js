
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
    name: 'serviceAdapters',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'adapter',
    importRemote: async () => {
      const services = await import('orderService/adapters');
      return services;
    }
  },
  {
    name: 'eventService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => {
      const services = await import('orderService/eventService');
      return services;
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
  },
  {
    name: 'inventoryService',
    url: 'http://localhost:8060/remoteEntry.js',
    path: __dirname,
    type: 'service',
    importRemote: async () => {
      const services = await import('orderService/inventoryService');
      return services;
    }
  },
]