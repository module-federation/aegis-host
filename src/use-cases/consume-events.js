'use strict'

import InterfaceAdapter from '../lib/adapter'

/**
 * @typedef EventSubscription
 * @property {function(string,string):any} subscribe
 */

/**
 * @callback EventSource
 * @param {*} client 
 * @param {function(string,string):any} callback
 * @returns {EventSubscription} 
 */

const subscriptions = new Map();

/**
 * @type {EventSource}
 */
export const EventSource = function (client, callback) {
  return {
    subscribe(topic, filter) {
      return callback(topic, filter);
    }
  }
}
/**
 * @typedef Consume
 * @property {function(InterfaceAdapter):any} subscribe 
 */

/**
 * 
 * @param {EventSource} eventSource
 * @returns {Consume}
 */
const EventConsumer = function (eventSource) {
  return {
    subscribe(adapter) {
      adapter.invoke(eventSource);
    },
    getSubscriptions() {
      return [...subscriptions.entries()];
    },
    unsubscribe(topic, id) {
      subscriptions.get(topic).delete(id);
    }
  }
}

/**
 * 
 * @param {EventSource} eventSource 
 * @returns {function(*,function(EventSource))):any}
 */
export default function consumerFactory(eventSource) {
  return async function consumeEvents(topic, id, callback) {
    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, callback);
      return;
    }
    subscriptions.set(topic, new Map());
    subscriptions.get(topic).set(id, callback);
    const serviceAdapter = InterfaceAdapter(topic);
    serviceAdapter.add(eventSource, function (eventSource) {
      eventSource.subscribe(topic, function (eventData) {
        subscriptions.get(topic).forEach(s => s.callback(eventData));
      });
    });
    const consumer = EventConsumer(eventSource);
    consumer.subscribe(serviceAdapter);
    return consumer;
  }
}
