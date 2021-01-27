"use strict";

import async from "../lib/async-error";

/**
 * @param {import("../models/model-factory).ModelFactory} models
 * @param {import("../models/model").Model} model
 * @param {import("../models".relations)} relation
 */
export default async function fetchRelatedModels(models, model, relation) {
  const spec = models.getModelSpec(model);

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return model;
  }

  if (relation && spec.relations && spec.relations[relation]) {
    const result = await async(model[relation]());

    if (result.ok) {
      return { model, [relation]: result.data };
    }
  }

  return model;
}
