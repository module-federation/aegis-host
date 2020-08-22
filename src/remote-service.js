import log from './lib/logger';

export default () => async (req, res) => {
  try {
    const callService1 = (await import('fedmonserv/service1')).default;
    const ret = await callService1();
    await res.send(ret);
    return ret;
  } catch (error) {
    log(error);
  }
};


