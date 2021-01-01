"use strict";

/**
 * Check `portFlow` history and resume workflow as needed.
 * @param {{
 *  models:import('../models').ModelFactory,
 *  model:Model,
 *  specs:import('../models/model-factory').ModelSpecification[],
 * }}
 */
async function resumeWorkflow({ models, model, specs }) {
  const spec = specs.find((s) => s.modelName === model.modelName);
  const portFlow = models.getPortFlow(model);

  if (portFlow?.length > 0) {
    const nextPort = spec.ports[portFlow[portFlow.length - 1]].producesEvent;
    model.emit(nextPort, model);
  }
}

/**
 * Called by datasource or other I/O module to unmarshal deserialized models.
 * @typedef {import('../models').Model} Model
 * @param {import('../models').ModelFactory} models
 * @param {import('../lib/observer').Observer} observer
 * @returns {function(Map<Model>):Map<string,Model>}
 */
export default function (models) {
  return function loadModels(savedModels) {
    const hydratedModels = new Map();
    const modelSpec = models.getRemoteModels();

    Promise.all(
      [...savedModels].map(async function ([modelId, savedModel]) {
        const model = models.loadModel(savedModel, savedModel.modelName);
        hydratedModels.set(modelId, model);
        await resumeWorkflow({ models, model, specs: modelSpec });
      })
    ).then();

    return hydratedModels;
  };
}
