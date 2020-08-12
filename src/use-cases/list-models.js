/**
 * 
 * @param {import('../datasources/datasource').default } repository 
 */
export default function listModelsFactory(repository) {
  return async function listModels() {
    //const factory = ModelFactory.getInstance();
    //const eventName = factory.Events.CREATE;
    // const model = await factory.createModel(modelName, input);
    // const event = await factory.createEvent(eventName, modelName, model);
    const modelData = await repository.list();
    //await observer.notify(event);
    return modelData;
  }
}