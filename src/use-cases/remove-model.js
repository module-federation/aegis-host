'use strict'

import ModelFactory from '../models';

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName 
 * @property {import('../datasources/datasource').default} repository 
 * @property {import('../lib/observer').Observer} observer
 * @property {...Function} handlers
 */

/**
 * 
 * @param {ModelParam} param0 
 */
export default function removeModelFactory({ repository, observer } = {}) {
  return async function removeModel(id) {
    const model = await repository.find(id);
    if (!model) {
      throw new Error('no such id');
    }
    const factory = ModelFactory.getInstance();
    const deleted = factory.deleteModel(model);
    const event = await factory.createEvent(
      factory.EventTypes.DELETE,
      factory.getModelName(model),
      deleted
    );
    await repository.delete(id);
    await observer.notify(event.eventName, event);
    return model;
  }
}