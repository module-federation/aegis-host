"use strict";

import makeAddModel from "./add-model";
import makeEditModel from "./edit-model";
import makeListModels from "./list-models";
import makeFindModel from "./find-model";
import makeRemoveModel from "./remove-model";
import makeLoadModels from "./load-models";
import makeListConfig from "./list-configs";
import DataSourceFactory from "../datasources";
import ObserverFactory from "../models/observer";
import ModelFactory from "../models";
import handleEvents from "./handle-events";

export function registerCacheEvents() {
  handleEvents(ObserverFactory.getInstance(), name =>
    DataSourceFactory.getDataSource(name, true)
  );
}

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

export const addModels = () => make(makeAddModel);
export const editModels = () => make(makeEditModel);
export const listModels = () => make(makeListModels);
export const findModels = () => make(makeFindModel);
export const removeModels = () => make(makeRemoveModel);
export const loadModels = () => make(makeLoadModels);
export const listConfigs = () => makeListConfig({ models: ModelFactory });
