"use strict";

/**
 * Check `portFlow` history and resume any workflow
 * that was running before we shut down.
 *
 * @param {{
 *  rehydratedModels:Map<string,Model>,
 *  models:import('../models').ModelFactory,
 *  specs:import('../models/model-factory').ModelSpecification[],
 * }}
 */
async function resumeWorkflow({ list, models, ports }) {
  console.log(list);
  await Promise.all(
    list.map(async function (model) {
      const flow = models.getPortFlow(model);

      if (flow?.length > 0) {
        const nextPort = ports[flow[flow.length - 1]].producesEvent;
        await model.emit(nextPort, model);
      }
    })
  );
}

// async function resumeWorkflow({ model, spec, models }) {
//   const portFlow = models.getPortFlow(model);
//   if (portFlow?.length > 0) {
//     const nextPort = spec.ports[portFlow[portFlow.length - 1]].producesEvent;
//     await model.emit(nextPort, model);
//   }
// }

function hydrate(loadModel, observer, repository) {
  return function (savedModels) {
    return new Map(
      [...savedModels].map(function ([k, v]) {
        const model = loadModel(observer, repository, v, v.modelName);
        return [k, model];
      })
    );
  };
}

/**
 * Factory function returns function called by datasource
 * or other I/O module to unmarshal deserialized models.
 * @typedef {import('../models').Model} Model
 * @param {{
 *  models:import('../models').ModelFactory,
 *  observer:import('../lib/observer').Observer,
 * }}
 * @returns {function(Map<string,Model>):Map<string,Model>}
 */
export default function ({ models, observer, repository, modelName }) {
  return function loadModels() {
    const spec = models
      .getRemoteModels()
      .find((s) => s.modelName === modelName);

    repository.load({
      hydrate: hydrate(models.loadModel, observer, repository),
      fileName: modelName,
      serializers: spec.serializers,
    });

    if (repository.size > 0) {
      resumeWorkflow(repository.list(), models, spec.ports)
        .then()
        .catch((e) => console.error(e));
    }
  };
}
