import ModelFactory from '../models';


/**
 * 
 * @param {String} modelName 
 * @param {import('../datasources/datasource').default} repository 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function addModelFactory(modelName, repository, observer) {
  return async function addModel(input) {
    const factory = ModelFactory.getInstance();
    const eventType = ModelFactory.eventTypes.CREATE;
    const model = await factory.createModel(modelName, input);
    const event = await factory.createEvent(eventType, modelName, model);
    await repository.save(model.getId(), model);
    await observer.notify(event.getEventName(), event);
    return model;
  }
}
