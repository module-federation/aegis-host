import { withId, withTimestamp } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';

/**
 * @typedef {import('../models/model-factory').EventType} EventType
 */

/**
 * @typedef {Object} Event
 * @property {EventType} eventType
 * @property {String} eventName
 * @property {String} eventTime
 * @property {String} modelName
 * @property {Object} modelData
 * @property {String} id
 */

/**
 * 
 */

const Event = (() => {

  /**
   * 
   * @param {{factory: Function, args: any, eventType: EventType, modelName: string}} options 
   * @returns {Promise<Event>}
   */
  const Event = async ({ factory, args, eventType, modelName }) => {
    return Promise.resolve(
      factory(args)
    ).then(event => ({
      eventName: (eventType + modelName).toUpperCase(),
      eventType,
      modelName,
      ...event
    }));
  };

  const makeEvent = asyncPipe(
    Event,
    withTimestamp('eventTime'),
    withId(uuid),
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, eventType: EventType, modelName: String}} options 
     * @returns {Promise<Event>}
     */
    create: async function (options) {
      return makeEvent(options);
    }
  }
})();

export default Event;


