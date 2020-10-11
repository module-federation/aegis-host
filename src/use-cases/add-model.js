import log from '../lib/logger';

/**
 * @typedef {Object} dependencies
 * @property {String} modelName 
 * @property {import('../models/index').ModelFactory} models
 * @property {import('../datasources/datasource').default} repository 
 * @property {import('../lib/observer').Observer} observer
 * @property {...Function} handlers
 */

/**
 * @param {dependencies} param0 
 */
export default function addModelFactory({
  modelName, models, repository, observer, handlers = []
} = {}) {
  const eventType = models.EventTypes.CREATE;
  const eventName = models.getEventName(eventType, modelName);
  handlers.push(async event => log({ event }));
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function addModel(input) {
    const model = await models.createModel(modelName, input);
    const event = await models.createEvent(eventType, modelName, model);

    await Promise.all([
      repository.save(models.getModelId(model), model),
      observer.notify(event.eventName, event)
    ]).catch(async (error) => {
      await repository.delete(models.getModelId(model));
      throw new Error(error);
    });

    return model;
  }
}
