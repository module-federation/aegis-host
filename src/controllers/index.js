import {
  addModels,
  editModels,
  listModels
} from "../use-cases";
import postModelFactory from "./post-model";
import patchModelFactory from "./patch-model";
import getModelFactory from './get-model';

function make(useCases, controllerFactory) {
  return useCases().map(useCase => ({
    modelName: useCase.modelName,
    factory: controllerFactory(useCase.factory)
  }));
}

export const postModels = () => make(addModels, postModelFactory);
export const patchModels = () => make(editModels, patchModelFactory);
export const getModels = () => make(listModels, getModelFactory);

