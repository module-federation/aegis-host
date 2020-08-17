import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import eventCallbacks from './event-callbacks';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import { MODEL_NAME as MODEL1 } from '../models/model1';

eventCallbacks(ObserverFactory.getInstance());

const UseCaseFactory = (() => {
  const dataSrc1 = DataSourceFactory.getDataSource1();
  const observer = ObserverFactory.getInstance();
  const addModel1 = addModelFactory({
    modelName: MODEL1,
    repository: dataSrc1,
    observer: observer
  });
  const editModel1 = editModelFactory({
    modelName: MODEL1,
    repository: dataSrc1,
    observer: observer
  });
  const listModel1 = listModelsFactory(dataSrc1);
  return Object.freeze({
    addModel1,
    editModel1,
    listModel1
  });
})();

export default UseCaseFactory;
