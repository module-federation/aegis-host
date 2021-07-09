"use strict";

import Serializer from "../domain/serializer";
import { resumeWorkflow } from "../domain/orchestrate";

/**
 * @param {function(import("../domain").Model)} loadModel
 * @param {import("../domain/observer").Observer} observer
 * @param {import("../datasources/datasource").default} repository
 * @returns {function(Map<string,Model>|Model)}
 */
function hydrateModels(loadModel, observer, repository) {
  return function (saved) {
    if (!saved) return;

    try {
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
    } catch (error) {
      console.warn(loadModel.name, error.message);
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
  if (process.env.RESUME_WORKFLOW_DISABLED) return;
  repository.list().then(resumeWorkflow).catch(handleError);
}

/**
 * Returns factory function to unmarshal deserialized models.
 * @typedef {import('../domain').Model} Model
 * @param {{
 *  models:import('../domain/model-factory').ModelFactory,
 *  observer:import('../domain/observer').Observer,
 *  repository:import('../datasources/datasource').default,
 *  modelName:string
 * }} options
 * @returns {function():Promise<void>}
 */
export default function ({ models, observer, repository, modelName }) {
  return async function loadModels() {
    const spec = models.getModelSpec(modelName);

    setInterval(handleRestart, 30000, repository);

    return repository.load({
      hydrate: hydrateModels(models.loadModel, observer, repository),
      serializer: Serializer.addSerializer(spec.serializers),
    });
  };
}
