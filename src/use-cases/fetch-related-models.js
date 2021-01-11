"use strict";

/**
 *
 * @param {import("../models").ModelFactory} models
 * @param {import("../models").Model} model
 * @param {{port:string}} query
 */
export default async function fetchRelatedModels(models, model, query) {
  const spec = models
    .getRemoteModels()
    .find((s) => s.modelName === models.getModelName(model));

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (query.relation && spec.relations[query.relation]) {
    const related = await model[query.relation]();
    if (related) {
      return { model, [query.relation]: related };
    }
  }

  return null;
}
