'use strict';

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
 * @type {WeakMap<any,WeakMap<string,*>>}
 */
const subscriptions = new WeakMap();

/**
 * @typedef {{
 * model:import('../models').Model;
 * args:[{
 *  id:string,
 *  callback:function(message,Subscription),
 *  topic:topic,
 *  filter:string|RegExp,
 *  once:boolean
 * }]}} adapterArgs
 * @param {adapterArgs} param
 */
const Subscription = function ({
  model,
  args: [{ callback, id, topic, filter, once }]
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
     * Filter message and invoke callback on match
     * @param {string} message
     */
    async filter(message) {
      if (filters) {
        if (filters.every(f => new RegExp(f).test(message))) {
          if (once) {
            this.unsubscribe();
          }
          callback({
            message,
            subscription: this,
          });                       
        }
        return;
      }
      callback({
        message,
        subscription: this,
      });
    },
  };
};

/**
 *
 * @type {adapterFactory}
 */
export function listen(service) {
  /**
   * @param {adapterArgs} options 
   */
  return async function (options) {
    const subscription = Subscription(options);

    const {
      args: [{ topic, id }],
    } = options;

    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, subscription);
      return subscription;
    }

    subscriptions.set(topic, new WeakMap().set(id, subscription));

    service.listen(topic, async function ({ topic, message }) {
      subscriptions.get(topic).forEach(function (subscription) {
        subscription.filter(message);
      });
    });
    return subscription;
  };
}

/**
 * @type {adapterFactory}
 * @returns {function(topic, eventData)}
 */
export async function notify(service) {
  return async function ({ topic, message }) {
    service.notify(topic, message);
  };
}
