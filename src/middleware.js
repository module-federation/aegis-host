import log from './lib/logger';
//import service1 from 'fedmonserv/service1';

export default async (app, done) => {
  try {
    // const service1 = (await import('fedmonserv/service1')).default;
    // const importService = require('./remote-service').default;
    // const remoteService = importService();
    // const s1 = await service1();
    // app.get('/remote-service', s1);
  } catch (error) {
    log(error);
  }
  done();
};