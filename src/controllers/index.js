"use strict";

import {
  addModels,
  editModels,
  listModels,
  findModels,
  removeModels,
  loadModels,
  listConfigs,
  registerCacheEvents,
} from "../use-cases";

import postModelFactory from "./post-model";
import patchModelFactory from "./patch-model";
import getModelsFactory from "./get-models";
import getModelByIdFactory from "./get-model-by-id";
import deleteModelFactory from "./delete-model";
import getConfigFactory from "./get-config";
import hash from "../lib/hash";

function make(useCases, controllerFactory) {
  return useCases().map(uc => ({
    endpoint: uc.endpoint,
    fn: controllerFactory(uc.fn, hash),
  }));
}

export const postModels = () => make(addModels, postModelFactory);
export const patchModels = () => make(editModels, patchModelFactory);
export const getModels = () => make(listModels, getModelsFactory);
export const getModelsById = () => make(findModels, getModelByIdFactory);
export const deleteModels = () => make(removeModels, deleteModelFactory);
export const getConfig = () => getConfigFactory(listConfigs());

export const initCache = () => {
  const label = "\ntime to load cache";
  const models = loadModels();

  async function load() {
    console.time(label);
    await Promise.all(models.map(async m => m.fn()));
    console.timeEnd(label);
    registerCacheEvents();
  }
  return {
    load,
  };
};
