import log from '../lib/logger';
import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import ModelFactory from '../models';
import { MODEL_NAME as MODEL1 } from '../models/model1';

const UseCaseFactory = (() => {
  const ds1 = DataSourceFactory.getDataSource1();
  const observer = ObserverFactory.getInstance();
  const eventType = ModelFactory.eventTypes.CREATE;
  const eventName = ModelFactory.getEventName(eventType, MODEL1);
  observer.on(eventName, async (event) => {
    log(`event fired ${eventName}`);
    log(event);
  });
  observer.on(eventName, async (event) => {
    log('attempting to call federated module');
    try {
      const fedmonserv = await import('fedmonserv/service1');
      fedmonserv.callService1(event);
    } catch (e) {
      log(e);
    }
  });
  const addModel1 = addModelFactory(MODEL1, ds1, observer);
  const editModel1 = editModelFactory(MODEL1, ds1, observer);
  const listModel1 = listModelsFactory(ds1);
  return Object.freeze({
    addModel1,
    editModel1,
    listModel1
  });
})();

export default UseCaseFactory;
