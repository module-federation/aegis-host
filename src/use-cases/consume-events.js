'use strict'

/**
 * @typedef EventSubscriber
 * @property {subscriptionCallback} subscribe
 */

/**
 * @callback eventHandler
 * @param {string} topic
 * @param {{value: string}} event
 */

/**
 * @callback subscriptionCallback
 * @param {string | RegExp} topic
 * @param {eventHandler} eventHandler
 */

/**
 * @callback EventSource
 * @param {*} client 
 * @param {subscriptionCallback} callback
 * @returns {EventSubscriber} 
 */

const subscriptions = new Map();

/**
 * @type {EventSource}
 */
export const EventSource = function (client, callback) {
  return {
    subscribe(topic, eventHandler) {
      return callback(topic, eventHandler);
    }
  }
}

/**
 * @typedef Consumer
 * @property {Function} getSubscriptions
 * @property {Function} unsubscribe
 */

/**
 * 
 * @returns {Consumer}
 */
const EventConsumer = function (topic, id) {
  return {
    getSubscriptions() {
      return [...subscriptions.entries()];
    },
    unsubscribe() {
      subscriptions.get(topic).delete(id);
    }
  }
}

/**
 * 
 * @param {EventSubscriber} eventSource 
 * @returns {function(*,function(EventSource))):any}
 */
export default function consumerFactory(eventSource) {
  return async function consumeEvents(topic, id, callback) {
    const consumer = EventConsumer(topic, id);
    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, callback);
      return consumer;
    }
    subscriptions.set(topic, new Map().set(id, callback));
    eventSource.subscribe(topic, function (eventData) {
      subscriptions.get(topic).forEach(function (callback, id) {
        const event = { ...eventData, consumer: EventConsumer(topic, id) };
        callback(event);
      });
    });
    return consumer;
  }
}
