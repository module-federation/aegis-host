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
    },
    getSubscriptions() {
      return [...subscriptions.entries()];
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
    }
  }
}

/**
 * 
 * @param {EventSource} eventSource 
 * @returns {function(*,function(EventSource))):any}
 */
export default function consumerFactory(eventSource) {
  return async function consumeEvents(service, adapterFn) {
    if (subscriptions.has(adapterFn)) {
      return;
    }
    subscriptions.set(adapterFn, service);
    const serviceAdapter = InterfaceAdapter(service);
    serviceAdapter.add(eventSource, adapterFn);
    EventConsumer(eventSource).subscribe(serviceAdapter);
  }
}
