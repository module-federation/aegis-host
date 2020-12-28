"use strict";

import ModelFactory from "../models";

/**
 * Called by datasource or other I/O module to unmarshal deserialized models.
 *
 * @param {import('../models').Model} savedModels
 */
export default function load(savedModels) {
  const hydratedModels = new Map();

  savedModels.forEach(function (savedModel, modelId) {
    const model = ModelFactory.loadModel(savedModel, savedModel.modelName);
    hydratedModels.set(modelId, model);
  });

  return hydratedModels;
}
