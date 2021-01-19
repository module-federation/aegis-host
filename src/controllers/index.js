"use strict";

import {
  addModels,
  editModels,
  listModels,
  findModels,
  removeModels,
  getModelId,
  loadModels,
} from "../use-cases";
import postModelFactory from "./post-model";
import patchModelFactory from "./patch-model";
import getModelFactory from "./get-model";
import getModelByIdFactory from "./get-model-by-id";
import deleteModelFactory from "./delete-model";
import hash from "../lib/hash";

function make(useCases, controllerFactory) {
  return useCases().map((uc) => ({
    endpoint: uc.endpoint,
    fn: controllerFactory(uc.fn, getModelId, hash),
  }));
}

export const postModels = () => make(addModels, postModelFactory);
export const patchModels = () => make(editModels, patchModelFactory);
export const getModels = () => make(listModels, getModelFactory);
export const getModelsById = () => make(findModels, getModelByIdFactory);
export const deleteModels = () => make(removeModels, deleteModelFactory);

export const initLoader = () => {
  const models = loadModels();
  function loadSavedModels() {
    models.forEach(m => m.fn());
  }
  return {
    loadSavedModels
  }
}
