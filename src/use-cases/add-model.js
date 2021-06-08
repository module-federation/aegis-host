"use strict";

import domainEvents from "../models/domain-events";

/**
 * @typedef {Object} dependencies injected dependencies
 * @property {String} modelName - name of the domain model
 * @property {import('../models/model-factory').ModelFactory} models - model factory
 * @property {import('../datasources/datasource').default} repository - persistence service
 * @property {import('../models/observer').Observer} observer - application events, propagated to domain
 * @property {...Function} handlers - event handlers can be registered by the domain
 */

/**
 * @typedef {function(ModelParam):Promise<import("../models").Model>} addModel
 * @param {dependencies} param0
 * @returns {function():Promise<import('../models').Model>}
 */
export default function makeAddModel({
  modelName,
  models,
  repository,
  observer,
  handlers = [],
} = {}) {
  const eventType = models.EventTypes.CREATE;
  const eventName = models.getEventName(eventType, modelName);
  handlers.forEach(handler => observer.on(eventName, handler));

  // Add an event whose callback invokes this factory.
  observer.on(domainEvents.addModel(eventName), addModel, false);
  async function addModel(input) {
    const model = await models.createModel(
      observer,
      repository,
      modelName,
      input
    );
    const event = await models.createEvent(eventType, modelName, model);

    try {
      await repository.save(model.getId(), model);
      await observer.notify(event.eventName, event);
    } catch (error) {
      await repository.delete(model.getId());
      throw new Error(error);
    }

    // Return the latest changes
    return repository.find(model.getId());
  }

  return addModel;
}
