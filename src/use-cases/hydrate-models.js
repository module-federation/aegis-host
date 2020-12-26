"use strict";

import { Observer } from "../lib/observer";
import ModelFactory from "../models";
import Model from "../models/model";

/**
 * Unmarshal deserialized models.
 * @param {*} savedModels
 */
export default function hydrate(savedModels, observer) {
  const hydratedModels = new Map();
  savedModels.forEach(function (savedModel, modelId) {
    // let writable = {};
    // for (let [v, k] of Object.entries(savedModel)) {
    //   Object.defineProperty(writable, v, {
    //     writable: true,
    //     enumerable: true,
    //     configurable: true,
    //   });
    // }
    ModelFactory.createModel(savedModel.modelName, savedModel).then(function (
      newModel
    ) {
      hydratedModels.set(
        modelId,
        newModel[Model.getKey("onLoad")]({
          ...newModel,
          ...savedModel,
          [Model.getKey("id")]: modelId,
          [Model.getKey("createTime")]: savedModel.createTime,
          [Model.getKey("portFlow")]: savedModel.portFlow,
        })
      );
    });
    // .then(function (model) {
    //   Observer.notify("deserialize".concat(savedModel.modelName), model);
    // });
  });
  return hydratedModels;
}
