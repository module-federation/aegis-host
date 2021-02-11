"use strict";

import Serializer from "../lib/serializer";
import resumeWorkflow from "./resume-workflow";

/**
 * @param {function():import()} loadModel
 * @param {*} observer
 * @param {*} repository
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

function handleRestart(repository) {
  console.log("resuming workflow");
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
  return function loadModels() {
    const spec = models.getModelSpec(modelName);

    repository.load({
      hydrate: hydrateModels(models.loadModel, observer, repository),
      serializer: Serializer.addSerializer(spec.serializers),
    });

    setTimeout(handleRestart, 30000, repository);
  };
}
