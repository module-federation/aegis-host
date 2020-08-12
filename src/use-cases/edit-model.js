import ModelFactory from '../models'

export default function editModelFactory(modelName, repository, observer) {
  return async function editModel(id, changes) {
    const eventName = ModelFactory.eventNames.UPDATE;
    const modelData = repository.find(id);
    if (!modelData) {
      throw new Error('no such id');
    }
    const model = await ModelFactory.createModel(modelName, ...modelData, ...changes);
    const event = await ModelFactory.createEvent(eventName, modelMName, model);
    await repository.save(model);
    await observer.notify(event);
  }
}