import log from './lib/logger';

export default () => async (...args) => {
  try {
    const callService1 = (await import('fedmonserv/service1')).default;
    return callService1(args);
  } catch (error) {
    log(error);
  }
};


