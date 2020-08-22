import log from './lib/logger';

export default async (app, done) => {
  try {
    const importService = require('./remote-service').default;
    const remoteService = importService();
    app.get('/remote-service', remoteService);
  } catch (error) {
    log(error);
  }
  done();
};