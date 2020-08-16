import ModelFactory from '../models';
import log from '../lib/logger';

/**
 * 
 * @param {*} param0 
 */
export default function editModelFactory({
  modelName,
  repository,
  observer,
  handlers = [event => log(event)]
} = {}) {

  const eventType = ModelFactory.eventTypes.UPDATE;
  const eventName = ModelFactory.getEventName(eventType, modelName);
  handlers.forEach(handler => observer.on(eventName, handler));

  return async function editModel(id, changes) {
    const modelData = repository.find(id);
    if (!modelData) {
      throw new Error('no such id');
    }
    const updates = { ...modelData, ...changes };
    const factory = ModelFactory.getInstance();
    const model = await factory.createModel(modelName, updates);
    const event = await factory.createEvent(eventType, modelName, model);
    await repository.save(model.getId(), model);
    await observer.notify(event.getEventName(), event);
    return model;
  }
}