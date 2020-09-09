import UseCaseFactory, {
  addModels,
  editModels
} from "../use-cases";
import postModelFactory from "./post-model";
import patchModelFactory from "./patch-model";
import getModelFactory from './get-model';
import Model from "../models/model";

const RestControllerFactory = (() => {
  const postModel1 = postModelFactory(UseCaseFactory.addModel1);
  const patchModel1 = patchModelFactory(UseCaseFactory.editModel1);
  const getModel1 = getModelFactory(UseCaseFactory.listModel1);
  const postModel2 = postModelFactory(UseCaseFactory.addModel2);
  const patchModel2 = patchModelFactory(UseCaseFactory.editModel2);
  return {
    getModel1,
    postModel1,
    patchModel1,
    postModel2,
    patchModel2
  };
})();


export default RestControllerFactory;

function make(useCases, controllerFactory) {
  console.log(useCases);
  return useCases().map(useCase => ({
    modelName: useCase.modelName,
    factory: controllerFactory(useCase.factory)
  }));
}


export const postModels = () => make(addModels, postModelFactory);
export const patchModels = () => make(editModels, patchModelFactory);

