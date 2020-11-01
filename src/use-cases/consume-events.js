'use strict'

import { Subscription } from '../adapters/event-source'

/**
 * @typedef {import('../adapters/event-source').eventHandler} eventHandler
 */

/**
 * @param {import('../adapters/event-source').EventSourceAdapter} eventSource
 * @returns {function(string|RegExp,string,eventHandler))):any}
 */
export default function consumerFactory(eventSource) {
  return async function consumeEvents(topic, id, handler) {
    const consumer = EventConsumer(topic, id);
    const subscriptions = eventSource.getSubscriptions();

    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, handler);
      return consumer;
    }

    subscriptions.set(topic, new Map().set(id, handler));

    eventSource.subscribe(topic, (eventData) => {
      subscriptions.get(topic).forEach((handle, id) => {
        const event = {
          ...eventData,
          consumer: EventConsumer(topic, id)
        };
        handle(event);
      });
    });

    return consumer;
  }
}

