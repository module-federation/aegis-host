import ModelFactory from '../models';
import Model from '../models/model';
import log from '../lib/logger';


/**
 * @typedef {Object} ModelParam
 * @property {String} modelName 
 * @property {import('../datasources/datasource').default} repository 
 * @property {import('../lib/observer').Observer} observer
 * @property {...Function} handlers
 */

/**
 * @param {ModelParam} param0 
 */
export default function addModelFactory({
  modelName,
  repository,
  observer,
  handlers = []
} = {}) {
  const eventType = ModelFactory.EventTypes.CREATE;
  const eventName = ModelFactory.getEventName(eventType, modelName);
  handlers.push(async event => log({ event }));
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function addModel(input) {
    const factory = ModelFactory.getInstance();
    const model = await factory.createModel(modelName, input);
    const event = await factory.createEvent(eventType, modelName, model);
    await repository.save(Model.getId(model), model);
    await observer.notify(event.eventName, event);
    return model;
  }
}
