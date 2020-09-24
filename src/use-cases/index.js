import addModelFactory from './add-model';
import editModelFactory from './edit-model';
import listModelsFactory from './list-models';
import findModelFactory from './find-model';
import DataSourceFactory from '../datasources';
import ObserverFactory from '../lib/observer';
import ModelFactory from '../models';
import handleEvents from './handle-events';

handleEvents(ObserverFactory.getInstance());

function buildOptions(model) {
  return {
    modelName: model.modelName,
    repository: DataSourceFactory.getDataSource(model.modelName),
    observer: ObserverFactory.getInstance()
  }
}

function make(factory) {
  const models = ModelFactory.getInstance().getRemoteModels();
  return models.map(model => ({
    modelName: model.modelName,
    fn: factory(buildOptions(model))
  }));
}

export const addModels = () => make(addModelFactory);
export const editModels = () => make(editModelFactory);
export const listModels = () => make(listModelsFactory);
export const findModels = () => make(findModelFactory);


