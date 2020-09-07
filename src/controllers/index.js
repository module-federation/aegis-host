import UseCaseFactory from "../use-cases";
import postModel1Factory from "./post-model1";
import patchModel1Factory from "./patch-model1";
import getModel1Factory from './get-model1';
import postModel2Factory from './post-model2';

const RestControllerFactory = (() => {
  const postModel1 = postModel1Factory(UseCaseFactory.addModel1);
  const patchModel1 = patchModel1Factory(UseCaseFactory.editModel1);
  const getModel1 = getModel1Factory(UseCaseFactory.listModel1);
  const postModel2 = postModel2Factory(UseCaseFactory.addModel2);
  return {
    getModel1,
    postModel1,
    patchModel1,
    postModel2
  };
})();

export default RestControllerFactory;
