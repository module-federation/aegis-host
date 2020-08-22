import ModelFactory from '../models';
import log from '../lib/logger';
import Model from '../models/model';

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
export default function editModelFactory({
  modelName,
  repository,
  observer,
  handlers = []
} = {}) {

  const eventType = ModelFactory.EventTypes.UPDATE;
  const eventName = ModelFactory.getEventName(eventType, modelName);
  handlers.push(async event => log({ event }));
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function editModel(id, changes) {
    const model = await repository.find(id);
    if (!model) {
      throw new Error('no such id');
    }

    const updated = { ...model, ...changes };
    log({ updated });
    const valid = await Model.validate(updated);
    if (!valid) {
      log({ valid: "false", updated });
      // throw new Error('invalid model');
    }

    const factory = ModelFactory.getInstance();
    const event = await factory.createEvent(eventType, modelName, { updated, changes });
    await repository.save(id, updated);
    await observer.notify(event.getEventName(), event);
    return updated;
  }
}