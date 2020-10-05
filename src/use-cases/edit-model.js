import ModelFactory from '../models';
import log from '../lib/logger';

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName 
 * @property {import('../datasources/datasource').default} repository 
 * @property {import('../lib/observer').Observer} observer
 * @property {Function[]} handlers
 */

/**
 * 
 * @param {ModelParam} param0 
 */
export default function editModelFactory({
  modelName, repository, observer, handlers = []
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

    const updated = ModelFactory.updateModel(model, changes);
    const event = await ModelFactory.createEvent(
      eventType, modelName, { updated, changes }
    );

    await Promise.all([
      repository.save(id, updated),
      observer.notify(event.eventName, event)
    ]).catch(async (error) => {
      await repository.save(id, model);
      throw new Error(error);
    });

    return updated;
  }
}