/**
 * @typedef {string|RegExp} topic
 */

/**
 * @callback eventHandler
 * @param {{
 *  topic: string,
 *  message: {
 *    value: string,
 *  },
 *  consumer: Subscription
 * }} event
 */

/**
 * @callback subscribeCallback
 * @param {topic} topic
 * @param {eventHandler} eventHandler
 */

/**
 * @typedef EventSourceAdapter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
 * @property {function(topic,eventHandler)} subscribe
 * @property {function():subscriptions} getSubscriptions
 */

/**
 * @callback EventSource
 * @param {subscribeCallback} subscribeCallback
 * @returns {EventSourceAdapter} 
 */

/**
 * @typedef {Object} Subscription
 * @property {function():Map<string, eventHandler>[]} getSubscriptions
 * @property {function():void} unsubscribe
 * @property {function():string} getId
 * @property {function():string} getTopic
 */

/**
 * @type {Map<string, Map<string, eventHandler>>}
 */
const subscriptions = new Map();

/**
 * @type {EventSource}
 */
export const EventSource = function (subscribeCallback) {
  return {
    subscribe(topic, eventHandler) {
      return subscribeCallback(topic, eventHandler);
    },
    getSubscriptions() {
      return subscriptions;
    }
  }
}

/**
 * @param {topic} topic
 * @param {string} id
 * @returns {Subscription}
 */
export const Subscription = function (topic, id) {
  return {
    getSubscriptions() {
      return [...subscriptions.entries()];
    },
    unsubscribe() {
      subscriptions.get(topic).delete(id);
    },
    getTopic() {
      return topic;
    },
    getId() {
      return id;
    }
  }
}
