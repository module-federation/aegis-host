import ModelFactory from '../models';

async function loadFedMon() {
  try {
    let fedmonserv = await import('fedmonserv/service1');
    fedmonserv.callService1('this function was imported from a remote module');
  } catch (e) {
    console.log(e)
  }
}

/**
 * 
 * @param {String} modelName 
 * @param {import('../datasources/datasource').default} repository 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function addModelFactory(modelName, repository, observer) {
  return async function addModel(input) {
    const factory = ModelFactory.getInstance();
    const eventName = ModelFactory.eventNames.CREATE;
    const model = await factory.createModel(modelName, input);
    const event = await factory.createEvent(eventName, modelName, model);
    await repository.save(model);
    await observer.notify(event);
    await loadFedMon();
    return model;
  }
}
