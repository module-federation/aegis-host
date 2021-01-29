"use strict";

import executeCommand from "./execute-command";
import invokePort from "./invoke-port";
import async from "../lib/async-error";

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../models/model-factory').ModelFactory} models
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../lib/observer').Observer} observer
 * @property {Function[]} handlers
 */

/**
 * @typedef editModel
 * @param {ModelParam} param0
 * @returns {function():Promise<import("../models/model").Model>}
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
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function editModel(id, changes, command) {
    const model = await repository.find(id);

    if (!model) {
      throw new Error("no such id");
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

    if (command) {
      const result = await async(executeCommand(updated, command, "write"));
      if (result.ok) {
        return result.data;
      }
    }

    const result = await async(invokePort(updated, command, "write"));
    if (result.ok) {
      return result.data;
    }

    return updated;
  };
}
