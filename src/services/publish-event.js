import log from '../lib/logger';

export default async (event) => {
  log('attempting to call federated module');
  try {
    const publishEvent = (await import('fedmonserv/publish-event')).default;
    publishEvent(event);
  } catch (error) {
    log(error);
  }
}