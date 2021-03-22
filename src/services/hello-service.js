import log from '@module-federation/aegis/esm/lib/logger';

export default () => async (req, res) => {
  // try {
    // const service1 = (await import('orderService/service1')).default;
    // return service1(body => {
    //   const status = body ? 200 : 500;
    //   res.status(status).send(body);
    // });
    //const remoteEntry = JSON.parse(req.body).remoteEntry;
    // const remoteEntry = "/Users/tmidboeus.ibm.com/federated-monolith/src/webpack/remoteEntry-localhost-8060-paymentService";
    // const factory = await require(remoteEntry).get('webpack/container/remote/orderService/models');
    // const Module = factory();
    // return Module;
    // console.log(Module);

    //     console.log(container);
    //     const factory = await container.get(module);
    //     console.log(factory);
    //     const Module = factory();
    //     console.log(Module);
    //     return Module;

  // } catch (error) {
  //   log(error);
  // }
};


