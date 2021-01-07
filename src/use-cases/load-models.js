"use strict";

import Serializer from "../lib/serializer";

/**
 * Check `portFlow` history and resume any workflow
 * that was running before we shut down.
 *
 * @param {{
 *  list:Map<string,Model>,
 *  models:import('../models').ModelFactory,
 *  ports:import('../models/  odelSpecification[],
 * }}
 */
async function resumeWorkflow(list, getWorkflowStatus, ports) {
  if (list?.length > 0) {
    await Promise.all(
      list.map(async function (model) {
        const status = getWorkflowStatus(model);
        if (status?.length > 0) {
          const nextPort = ports[status[status.length - 1]].producesEvent;
          await model.emit(nextPort, model);
        }
      })
    );
  }
}

function hydrateModels(loadModel, observer, repository) {
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
 * Factory returns function to unmarshal deserialized 
 * models and resume any workflow that was running 
 * before we shut down.
 * @typedef {import('../models').Model} Model
 * @param {{
 *  models:import('../models').ModelFactory,
 *  observer:import('../lib/observer').Observer,
 *  repository:import('../datasources/datasource').default,
 *  modelName:string
 * }}
 * @returns {function()}
 */
export default function ({ models, observer, repository, modelName }) {
  return function loadModels() {
    const spec = models
      .getRemoteModels()
      .find((s) => s.modelName === modelName);

    repository.load({
      fileName: modelName,
      hydrate: hydrateModels(models.loadModel, observer, repository),
      serializer: Serializer.addSerializer(spec.serializers),
    });

    repository
      .list()
      .then((list) => resumeWorkflow(list, models.getPortFlow, spec.ports))
      .catch((e) => console.error(e));
  };
}
