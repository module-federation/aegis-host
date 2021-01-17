"use strict";

import executeCommand from "./execute-command";

/**
 * @typedef {Object} dependencies injected dependencies
 * @property {String} modelName - name of the domain model
 * @property {import('../models/model-factory').ModelFactory} models - model factory
 * @property {import('../datasources/datasource').default} repository - persistence service
 * @property {import('../lib/observer').Observer} observer - application events, propagated to domain
 * @property {...Function} handlers - event handlers can be registered by the domain
 */

/**
 * @param {dependencies} param0
 */
export default function addModelFactory({
  modelName,
  models,
  repository,
  observer,
  handlers = [],
} = {}) {
  const eventType = models.EventTypes.CREATE;
  const eventName = models.getEventName(eventType, modelName);
  handlers.forEach((handler) => observer.on(eventName, handler));

  return async function addModel(input, command) {
    const model = await models.createModel(
      observer,
      repository,
      modelName,
      input
    );
    const event = await models.createEvent(eventType, modelName, model);

    try {
      await repository.save(models.getModelId(model), model);
      await observer.notify(event.eventName, event);
    } catch (error) {
      await repository.delete(models.getModelId(model));
      throw new Error(error);
    }

    if (command) {
      const result = await executeCommand(models, model, command, "write");
      if (result) {
        return result;
      }
    }

    return model;
  };
}
