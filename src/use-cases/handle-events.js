import log from '../lib/logger';

/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function (observer) {

  observer.on('*', async event => {
    log('attempting to call federated module');
    try {
      const publishEvent = (await import('fedmonserv/publish-event')).default;
      publishEvent(event);
    } catch (error) {
      log(error);
    }
  });

}