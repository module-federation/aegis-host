import ModelFactory from "../models";
import log from '../lib/logger';
import { MODEL_NAME as MODEL1 } from '../models/model1';

/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function eventCallbacks(observer) {

  observer.on(
    ModelFactory.getEventName(
      ModelFactory.eventTypes.CREATE,
      MODEL1
    ),
    async (event) => {
      log(`event fired ${eventName}`);
      log(event);
    }
  );

  observer.on(
    ModelFactory.getEventName(
      ModelFactory.eventTypes.CREATE,
      MODEL1
    ),
    async (event) => {
      log('attempting to call federated module');
      try {
        const fedmonserv = await import('fedmonserv/service1');
        fedmonserv.callService1(event);
      } catch (e) {
        log(e);
      }
    }
  );

}