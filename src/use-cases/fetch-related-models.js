"use strict";

import async from "../lib/async-error";

/**
 *models").ModelFactory
 * @param {import("../} models
 * @param {import("../models/model-factory").Model} model
 * @param {{relation:string}} query
 */
export default async function fetchRelatedModels(models, model, relation) {
  const spec = models.getModelSpec(model);

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (relation && spec.relations && spec.relations[relation]) {
    const result = await async(model[relation]());

    if (result.ok) {
      return { model, [relation]: result.data };
    }
  }

  return null;
}
