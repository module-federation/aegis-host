'use strict'

import { withId, withTimestamp } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';

/**
 * @typedef {import('../models/model-factory').EventType} EventType
 */

/** 
 * @typedef {{
 *  factory: function(*):any, 
 *  args: any, 
 *  eventType: EventType, 
 *  modelName: String
 * }} options 
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
 * @namespace
 */
const Event = (() => {

  /**
   * @lends Event
   * @namespace
   * @class
   * @param {options} options
   * @returns {Promise<Readonly<Event>>}
   */
  const Event = async ({
    factory,
    args,
    eventType,
    modelName
  }) => Promise.resolve(
    factory(args)
  ).then(event => ({
    ...event,
    eventName: (eventType + modelName).toUpperCase(),
    eventType,
    modelName
  }))

  const makeEvent = asyncPipe(
    Event,
    withTimestamp('eventTime'),
    withId('id', uuid),
    Object.freeze
  );

  return {
    /**
     * Create event
     * @param {options} options
     * @returns {Promise<Readonly<Event>>}
     */
    create: async (options) => makeEvent(options)
  }
})();

export default Event;


