import log from './lib/logger';

export default () => async (req, res) => {
  try {
    const service1 = (await import('fedmonserv/service1')).default;
    return service1(body => {
      const status = body ? 200 : 500;
      res.status(status).send(body);
    });
  } catch (error) {
    log(error);
  }
};


