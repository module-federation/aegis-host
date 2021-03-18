"use strict";

import addModelFactory from "./add-model";
import editModelFactory from "@module-federation/aegis/esm/models/edit-model";
import listModelsFactory from "./list-models";
import findModelFactory from "./find-model";
import removeModelFactory from "./remove-model";
import loadModelsFactory from "./load-models";
import listConfigFactory from "./list-configs";
import DataSourceFactory from "../datasources";
import ObserverFactory from "../models/observer";
import ModelFactory from "../models";
import handleEvents from "./handle-events";

handleEvents(ObserverFactory.getInstance());

/**
 *
 * @param {import('../models').ModelSpecification} model
 */
function buildOptions(model) {
  return {
    modelName: model.modelName,
    models: ModelFactory,
    observer: ObserverFactory.getInstance(),
    handlers: model.eventHandlers,
    repository: DataSourceFactory.getDataSource(model.modelName),
  };
}

function make(factory) {
  const models = ModelFactory.getRemoteModels();
  return models.map(model => ({
    endpoint: model.endpoint,
    fn: factory(buildOptions(model)),
  }));
}

export const addModels = () => make(addModelFactory);
export const editModels = () => make(editModelFactory);
export const listModels = () => make(listModelsFactory);
export const findModels = () => make(findModelFactory);
export const removeModels = () => make(removeModelFactory);
export const loadModels = () => make(loadModelsFactory);
export const listConfigs = () => listConfigFactory({ models: ModelFactory });
