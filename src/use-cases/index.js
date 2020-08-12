import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import { MODEL_NAME as MODEL1 } from '../models/model1'

const UseCaseFactory = (() => {
  const ds1 = DataSourceFactory.getDataSource1();
  const observer = ObserverFactory.getInstance();
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
