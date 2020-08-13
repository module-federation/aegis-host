import log from '../lib/logger';
import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import { MODEL_NAME as MODEL1 } from '../models/model1'
import { EVENT_NAME as MODEL1_CREATE_EVENT } from '../models/model1-create-event'

const UseCaseFactory = (() => {
  const ds1 = DataSourceFactory.getDataSource1();
  const observer = ObserverFactory.getInstance();
  observer.on(MODEL1_CREATE_EVENT, async (event) => {
    console.log(MODEL1_CREATE_EVENT);
    log(event);
    try {
      let fedmonserv = await import('fedmonserv/service1');
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
