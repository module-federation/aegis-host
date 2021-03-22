"use strict";

import async from "../lib/async-error";

/**
 * @param {import("@module-federation/aegis/esm/models/model").Model} model
 * @param {import("@module-federation/aegis/esm/models".relations)} relation
 */
export default async function fetchRelatedModels(model, relation) {
  const spec = model.getSpec();

  if (relation && spec.relations && spec.relations[relation]) {
    const result = await async(model[relation]());

    if (result.ok) {
      return { [model.getName()]: model, [relation]: result.data };
    }
  }

  return model;
}
