import log from './lib/logger';

export default async (app, path, next) => {
  try {
    const importService = require('./remote-service').default;
    const remoteService = importService();
    app.get(path + '/remote-service', remoteService);
  } catch (error) {
    log(error);
  }
  next();
};