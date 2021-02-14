"use strict";

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../models').ModelFactory} models
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../models/observer').Observer} observer
 * @property {...Function} handlers
 */

/**
 *
 * @param {ModelParam} param0
 */
export default function removeModelFactory({
  modelName,
  models,
  repository,
  observer,
  handlers = [],
} = {}) {
  const eventType = models.EventTypes.DELETE;
  const eventName = models.getEventName(eventType, modelName);
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function removeModel(id) {
    const model = await repository.find(id);
    if (!model) {
      throw new Error("no such id");
    }

    const deleted = models.deleteModel(model);
    const event = await models.createEvent(eventType, modelName, deleted);

    await Promise.all([
      repository.delete(id),
      observer.notify(event.eventName, event),
    ]).catch(async error => {
      console.error(error);
      await repository.save(id, model);
      throw new Error(error);
    });

    return model;
  };
}
