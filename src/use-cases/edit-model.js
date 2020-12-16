'use strict';

import log from '../lib/logger';

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../models').ModelFactory} models
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../lib/observer').Observer} observer
 * @property {Function[]} handlers
 */

/**
 *
 * @param {ModelParam} param0
 */
export default function editModelFactory({
  modelName,
  models,
  repository,
  observer,
  handlers = [],
} = {}) {
  const eventType = models.EventTypes.UPDATE;
  const eventName = models.getEventName(eventType, modelName);
  handlers.forEach((handler) => observer.on(eventName, handler));

  return async function editModel(id, changes) {
    const model = await repository.find(id);
    if (!model) {
      throw new Error('no such id');
    }

    const updated = models.updateModel(model, changes);
    const event = await models.createEvent(eventType, modelName, {
      updated,
      changes,
    });

    try {
      await repository.save(id, updated);
      await observer.notify(event.eventName, event);
    } catch (error) {
      await repository.save(id, model);
      throw new Error(error);
    }

    return updated;
  };
}
