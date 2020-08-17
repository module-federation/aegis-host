import ModelFactory from '../models';
import log from '../lib/logger';

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

  const eventType = ModelFactory.eventTypes.UPDATE;
  const eventName = ModelFactory.getEventName(eventType, modelName);
  handlers.push(event => log(event));
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function editModel(id, changes) {
    const modelData = await repository.find(id);
    if (!modelData) {
      throw new Error('no such id');
    }
    const updates = { ...modelData, ...changes };
    const factory = ModelFactory.getInstance();
    const event = await factory.createEvent(eventType, modelName, updates);
    await repository.save(id, updates);
    await observer.notify(event.getEventName(), event);
    return updates;
  }
}