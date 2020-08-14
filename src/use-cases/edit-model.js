import ModelFactory from '../models'

export default function editModelFactory(modelName, repository, observer) {
  return async function editModel(id, changes) {
    const eventType = ModelFactory.eventTypes.CREATE;
    const modelData = repository.find(id);
    if (!modelData) {
      throw new Error('no such id');
    }
    const model = await ModelFactory.createModel(modelName, ...modelData, ...changes);
    const event = await ModelFactory.createEvent(eventType, modelMName, model);
    await repository.save(model.getUuid(), model);
    await observer.notify(event.getName(), event);
  }
}