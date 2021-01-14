"use strict";

/**
 *
 * @param {import("../models").ModelFactory} models
 * @param {import("../models").Model} model
 * @param {{relation:string}} query
 */
export default async function fetchRelatedModels(models, model, relation) {
  const spec = models
    .getRemoteModels()
    .find((s) => s.modelName === models.getModelName(model));

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (relation && spec.relations[relation]) {
    const related = await model[relation]();
    if (related) {
      return { model, [relation]: related };
    }
  }

  return null;
}
