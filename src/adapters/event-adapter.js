'use strict'

import uuid from '../lib/uuid';

/**
 * @typedef {import('../models/order').Order} Order
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
 * @type {Map<any,Map<string,Subscription>>}
 */
const subscriptions = new Map();

const Subscription = function ({ id, callback, topic, filter, once, model }) {
  return {
    unsubscribe() {
      console.log('subscriptions.get(%s).delete(%s)', topic, id);
      console.log(subscriptions);
      return subscriptions.get(topic) && subscriptions.get(topic).delete(id);
    },

    getId() {
      return id;
    },

    getModel() {
      return model;
    },

    async filter(message) {
      if (!filter) {
        return false;
      }
      const regex = new RegExp(filter);
      if (regex.test(message)) {
        await callback({
          message: message,
          subscription: this,
        });
        if (once) {
          this.unsubscribe();
        }
      }
      return true;
    }
  }
}

/**
 * @type {adapterFactory}
 */
export function listen(service) {

  return async function ({
    model, parms: [{ topic, callback, filter, once, id }]
  }) {
    console.log('listen: %s %s', model, topic);
    const subscription = Subscription({ id, topic, callback, filter, once, model });

    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, subscription);
      return;
    }
    subscriptions.set(topic, new Map().set(id, subscription));

    service.listen(topic, async function ({ topic, message }) {
      subscriptions.get(topic).forEach(async subscription => {
        if (subscription.filter(message)) {
          return;
        }
        await subscription.callback({ message, subscription });
      });
    });
    return subscription;
  }
}

/**
 * @type {adapterFactory}
 * @returns {function(topic, eventData)}
 */
export async function notify(service) {
  return async function ({ parms: [topic, event] }) {
    service.notify(topic, event);
  }
}