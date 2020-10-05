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
 * @param {ModelParam} param0 
 */
export default function addModelFactory({
  modelName, repository, observer, handlers = []
} = {}) {
  const eventType = ModelFactory.EventTypes.CREATE;
  const eventName = ModelFactory.getEventName(eventType, modelName);
  handlers.push(async event => log({ event }));
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function addModel(input) {
    const model = await ModelFactory.createModel(modelName, input);
    const event = await ModelFactory.createEvent(eventType, modelName, model);

    await Promise.all([
      repository.save(ModelFactory.getModelId(model), model),
      observer.notify(event.eventName, event)
    ]).catch(async (error) => {
      await repository.delete(ModelFactory.getModelId(model));
      throw new Error(error);
    });

    return model;
  }
}
