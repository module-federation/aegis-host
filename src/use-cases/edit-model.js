import ModelFactory from '../models';
import log from '../lib/logger';

/**
 * 
 * @param {String} modelName 
 * @param {import('../datasources/datasource').default} repository 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function editModelFactory(modelName, repository, observer) {
  return async function editModel(id, changes) {
    const eventType = ModelFactory.eventTypes.UPDATE;
    const modelData = repository.find(id);
    if (!modelData) {
      throw new Error('no such id');
    }
    const updates = { ...modelData, ...changes };
    log(updates);
    const factory = ModelFactory.getInstance();
    const model = await factory.createModel(modelName, updates);
    const event = await factory.createEvent(eventType, modelName, model);
    await repository.save(model.getId(), model);
    await observer.notify(event.getEventName(), event);
    return model;
  }
}