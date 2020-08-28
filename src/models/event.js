import { withId, withEventTimestamp, utc } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';

/**
 * @typedef {Object} Event
 * @property {Function} getEventName
 * @property {String} id
 * @property {String} eventType
 * @property {String} modelName
 */

const Event = (() => {

  /**
   * 
   * @param {{factory: Function, args: any, eventType: string, modelName: string}} options 
   * @returns {Promise<Event>}
   */
  const Event = async ({ factory, args, eventType, modelName }) => {
    return Promise.resolve(
      factory(args)
    ).then(event => ({
      getEventName: () => eventType + modelName,
      eventType: eventType,
      modelName: modelName,
      ...event
    }));
  };

  const makeEvent = asyncPipe(
    Event,
    withEventTimestamp(utc),
    withId(uuid),
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, eventType: String, modelName: String}} options 
     * @returns {Promise<Event>}
     */
    create: async function (options) {
      return makeEvent(options);
    }
  }
})();

export default Event;


