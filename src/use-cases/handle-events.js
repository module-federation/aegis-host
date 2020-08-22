import ModelFactory from '../models';
import log from '../lib/logger';
import { MODEL_NAME as MODEL1 } from '../models/model1';

/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function handleEvents(observer) {

  observer.on(
    ModelFactory.getEventName(
      ModelFactory.EventTypes.CREATE,
      MODEL1
    ),
    async event => {
      log(`event fired ${event.getEventName()}`);
    }
  );

  observer.on(
    ModelFactory.getEventName(
      ModelFactory.EventTypes.CREATE,
      MODEL1
    ),
    async event => {
      log('attempting to call federated module');
      try {
        const publishEvent = (await import('fedmonserv/publish-event')).default;
        await publishEvent(event);
      } catch (error) {
        log(error);
      }
    }
  );

}