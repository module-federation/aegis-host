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
      console.log('EventConsumer subscribe')
      console.log(adapter);
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
    console.log('consumeEvents >>>>>>>>>>>>>>>>>>>');
    const serviceAdapter = InterfaceAdapter(service);
    serviceAdapter.add(eventSource, adapterFn);
    EventConsumer(eventSource).subscribe(serviceAdapter);
  }
}
