import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import handleEvents from './handle-events';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import ModelFactory from '../models';

handleEvents(ObserverFactory.getInstance());

function make(factory) {
  const models = ModelFactory.getInstance().getRemoteModels();
  const dataSrc1 = DataSourceFactory.getDataSource1();
  const observer = ObserverFactory.getInstance();
  function buildOptions(model) {
    let options = {
      modelName: model.modelName,
      repository: dataSrc1,
      observer: observer
    }
    if (typeof model.fnHandler === 'function') {
      options.handlers = [model.fnHandler];
    }
    return options;
  }
  return models.map(model => ({
    modelName: model.modelName,
    fn: factory(buildOptions(model))
  }));
}

export const addModels = () => make(addModelFactory);
export const editModels = () => make(editModelFactory);
export const listModels = () => make(listModelsFactory);


