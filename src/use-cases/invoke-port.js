"use strict";

import async from "../lib/async-error";

/**
 *
 * @param {import("../models/model-factory").ModelFactory} models
 * @param {import("../models/model").Model} model
 * @param {{port:string}} query
 */
export default async function invokePort(models, model, query) {
  const spec = models.getModelSpec(model);

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (query.port && spec.ports && spec.ports[query.port]) {
    const callback = spec.ports[query.port].callback;

    if (callback) {
      const result = await async(model[query.port](callback));
      if (result.ok) {
        return { ...model, ...result.data };
      }
    }

    const result = await async(model[query.port]());
    if (result.ok) {
      return { ...model, ...result.data };
    }
  }
  return null;
}
