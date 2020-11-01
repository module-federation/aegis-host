/**
 * 
 * @typedef {string | RegExp} topic
 */

/**
 * @typedef {object} EventTargetAdapter
 * @property {function(topic,import('../models/event').Event)} fireEvent
 */

/**
 * @callback EventTarget
 * @param {producerCallback} producerCallback
 * @returns {EventTargetAdapter}
 */

/**
 * @callback producerCallback
 * @param {string | RegExp} topic
 * @param {import('../models/event').Event} event
 */

/**
 * @type {EventTarget}
 */
export const EventTarget = function (producerCallback) {
  return {
    fireEvent({ topic, id, event }) {
      return producerCallback({ topic, id, event });
    }
  }
}