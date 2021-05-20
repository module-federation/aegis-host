"use strict";

import Serializer from "../lib/serializer";
import resumeWorkflow from "./resume-workflow";

/**
 * @param {function(import("../models").Model)} loadModel
 * @param {import("../models/observer").Observer} observer
 * @param {import("../datasources/datasource").default} repository
 * @returns {function(Map<string,Model>|Model)}
 */
function hydrateModels(loadModel, observer, repository) {
  return function (saved) {
    if (!saved) return;

    if (saved instanceof Map) {
      return new Map(
        [...saved].map(function ([k, v]) {
          const model = loadModel(observer, repository, v, v.modelName);
          return [k, model];
        })
      );
    }

    if (Object.getOwnPropertyNames(saved).includes("modelName")) {
      return loadModel(observer, repository, saved, saved.modelName);
    }
  };
}

function handleError(e) {
  console.error(e);
}
/**
 *
 * @param {import("../datasources/datasource").default} repository
 */
function handleRestart(repository) {
  // console.log("resuming workflow", repository.name);
  repository.list().then(resumeWorkflow).catch(handleError);
}

/**
 * Factory returns function to unmarshal deserialized models
 * @typedef {import('../models').Model} Model
 * @param {{
 *  models:import('../models/model-factory').ModelFactory,
 *  observer:import('../models/observer').Observer,
 *  repository:import('../datasources/datasource').default,
 *  modelName:string
 * }} options
 */
export default function ({ models, observer, repository, modelName }) {
  return async function loadModels() {
    const spec = models.getModelSpec(modelName);

    setTimeout(handleRestart, 30000, repository);

    return repository.load({
      hydrate: hydrateModels(models.loadModel, observer, repository),
      serializer: Serializer.addSerializer(spec.serializers),
    });
  };
}
