import log from './lib/logger';

export default async (done) => {
  try {
    const importService = require('./remote-service').default;
    const remoteService = importService();
    const output = await remoteService('imported ', 'remote ', ' service');
    log(output);
  } catch (error) {
    log(error);
  }
  done();
};