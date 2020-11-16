'use strict'

/**
 * @typedef {string|RegExp} topic
 * @callback eventHandler
 * @param {string} eventData
 * @typedef {eventHandler} notifyType 
 * @typedef {{
 * listen:function(topic, eventHandler),
 * notify:notifyType
 * }} EventService 
 * @callback adapterFactory
 * @param {EventService} service
 * @returns {function(topic, eventHandler)} 
 */

/**
 * @type {Map<any,Map<string,*>>}
 */
const subscriptions = new Map();

/**
 * @typedef {string} message
 * @typedef {string|RegExp} topic 
 * @param {{
 *  id:string,
 *  callback:function(message,Subscription),
 *  topic:topic,
 *  filter:string|RegExp,
 *  once:boolean,
 *  model:object
 * }} options
 */
const Subscription = function ({
  id, callback, topic, filter, once, model
}) {
  return {
    /**
     * unsubscribe from topic
     */
    unsubscribe() {
      subscriptions.get(topic).delete(id);
    },

    getId() {
      return id;
    },

    getModel() {
      return model;
    },

    getSubscriptions() {
      return [...subscriptions.entries()];
    },

    /**
     * Filter message and invoke callback
     * @param {string} message 
     */
    async filter(message) {
      if (filter) {
        const regex = new RegExp(filter);

        if (regex.test(message)) {
          if (once) {
            this.unsubscribe();
          }
          callback({ message, subscription: this });
        }
        return;
      }
      callback({ message, subscription: this });
    }
  }
}

/**
 *
 * @type {adapterFactory}
 */
export function listen(service) {
  return async function ({
    model, resolve, args: [{ topic, callback, filter, once, id }]
  }) {
    const subscription = Subscription({
      id, topic, callback, filter, once, model
    });

    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, subscription);
      resolve(subscription);
      return;
    }

    subscriptions.set(topic, new Map().set(id, subscription));
    service.listen(topic, async function ({ topic, message }) {
      subscriptions.get(topic).forEach(async subscription => {
        subscription.filter(message);
      });
    });
    resolve(subscription);
  }
}

/**
 * @type {adapterFactory}
 * @returns {function(topic, eventData)}
 */
export async function notify(service) {
  return async function ({ topic, message }) {
    service.notify(topic, message);
  }
}