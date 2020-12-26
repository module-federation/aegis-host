"use strict";

import ModelFactory from "../models";
import Model from "../models/model";

/**
 * Called by datasource or other I/O module to unmarshal deserialized models.
 *
 * @param {import('../models').Model} savedModels
 */
export default function hydrate(savedModels) {
  const hydratedModels = new Map();

  // Create new models and merge them with the saved copies.
  savedModels.forEach(function (savedModel, modelId) {
    ModelFactory.createModel(savedModel.modelName, savedModel).then(function (
      newModel
    ) {
      hydratedModels.set(
        modelId,
        // Handle any special serialization requirements
        newModel[Model.getKey("onLoad")]({
          ...newModel,
          ...savedModel,
          [Model.getKey("id")]: modelId,
          [Model.getKey("createTime")]: savedModel.createTime,
          [Model.getKey("portFlow")]: savedModel.portFlow,
        })
      );
    });
  });
  return hydratedModels;
}
