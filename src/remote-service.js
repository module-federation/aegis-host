import log from './lib/logger';

export default () => async (...args) => {
  try {
    const callService1 = (await import('fedmonserv/service1')).default;
    const ret = callService1(args);
    const callService2 = (await import('fedmonserv/service2')).default;
    await callService2();
    return ret;
  } catch (error) {
    log(error);
  }
};


