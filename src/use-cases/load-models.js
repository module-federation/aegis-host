"use strict";

/**
 * Check `portFlow` history and resume workflow as needed.
 * @param {{
 *  models:import('../models').ModelFactory,
 *  model:Model,
 *  specs:import('../models/model-factory').ModelSpecification[],
 *  observer:Observer
 * }}
 */
function resumeWorkflow({ models, model, specs, observer }) {
  const spec = specs.find((s) => s.modelName === model.modelName);

  if (spec) {
    const flow = models.getPortFlow(model);
    const nextPort = spec.ports[flow[flow.length - 1]].producesEvent;

    if (flow?.length > 0) {
      setTimeout(() => observer.notify(nextPort, model), 30000);
    }
  }
}

/**
 * Called by datasource or other I/O module to unmarshal deserialized models.
 * @typedef {import('../models').Model} Model
 * @param {import('../models').ModelFactory} models
 * @param {import('../lib/observer').Observer} observer
 * @returns {function(Model):Map<string,Model>}
 */
export default function (models, observer) {
  return function loadModels(savedModels) {
    const hydratedModels = new Map();
    const specs = models.getRemoteModels();

    savedModels.forEach(function (savedModel, modelId) {
      const model = models.loadModel(savedModel, savedModel.modelName);
      if (!model) {
        console.error("failed to load model: %s", modelId);
      }
      resumeWorkflow({ models, model, specs, observer });
      hydratedModels.set(modelId, model);
    });

    return hydratedModels;
  };
}
