"use strict";

import { Event } from "../services/event-service";
/**
 * @typedef {import('../models').Model} Model
 * @typedef {string} serviceName
 *
 * @typedef {Object} EventMessage
 * @property {serviceName} eventSource
 * @property {serviceName|"broadcast"} eventTarget
 * @property {"command"|"commandResponse"|"notification"|"import"} eventType
 * @property {string} eventName
 * @property {string} eventTime
 * @property {string} eventUuid
 * @property {NotificationEvent|ImportEvent|CommandEvent} eventData
 *
 * @typedef {object} ImportEvent
 * @property {"service"|"model"|"adapter"} type
 * @property {string} url
 * @property {string} path
 * @property {string} importRemote
 *
 * @typedef {object} NotificationEvent
 * @property {string|} message
 * @property {"utf8"|Uint32Array} encoding
 * *
 * @typedef {Object} CommandEvent
 * @property {string} commandName
 * @property {string} commandResp
 * @property {*} commandArgs
 */

/**
 * @typedef {{
 *  getModel:import('../models').Model,
 * }} Subscription
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

function applyFilter(message) {
  return function (filter) {
    const regex = new RegExp(filter);
    const result = regex.test(message);
    console.log({ func: applyFilter.name, filter, result, message });
    return result;
  };
}

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
const Subscription = function ({ id, callback, topic, filters, once, model }) {
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
      if (filters) {
        if (filters.every(applyFilter(message))) {
          if (once) {
            this.unsubscribe();
          }
          callback({ message, subscription: this });
          return;
        }
        console.log("filters didn't match: keep listening", message);
        return;
      }
      callback({ message, subscription: this });
    },
  };
};

/**
 *
 * @type {adapterFactory}
 */
export function listen(service = Event) {
  return async function ({
    model,
    args: [{ topic, callback, filters, once, id }],
  }) {
    const subscription = Subscription({
      id,
      topic,
      callback,
      filters,
      once,
      model,
    });

    if (subscriptions.has(topic)) {
      subscriptions.get(topic).set(id, subscription);
      return subscription;
    }

    subscriptions.set(topic, new Map().set(id, subscription));

    if (!service.listening) {
      service.listen(/Channel/, async function ({ topic, message }) {
        if (subscriptions.has(topic)) {
          subscriptions.get(topic).forEach(async (subscription) => {
            await subscription.filter(message);
          });
        }
      });
    }
    return subscription;
  };
}

/**
 * @type {adapterFactory}
 * @returns {function(topic, eventData)}
 */
export function notify(service = Event) {
  return async function ({ model, args: [topic, message] }) {
    console.log("sending...", { topic, message: JSON.parse(message) });
    await service.notify(topic, message);
    return model;
  };
}
