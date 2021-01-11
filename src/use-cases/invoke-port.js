"use strict";

/**
 *
 * @param {import("../models").ModelFactory} models
 * @param {import("../models").Model} model
 * @param {{port:string}} query
 */
export default async function invokePort(models, model, query) {
  const spec = models
    .getRemoteModels()
    .find((s) => s.modelName === models.getModelName(model));

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (query.port && spec.ports[query.port]) {
    const callback = spec.ports[query.port].callback;
    if (callback) {
      const result = await model[query.port](callback);
      if (result) {
        return { ...model, ...result };
      }
    }
    const result = await model[query.port]();
    if (result) {
      return { ...model, ...result };
    }
  }
  return null;
}
