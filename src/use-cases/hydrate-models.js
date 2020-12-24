"use strict";

import ModelFactory from "../models";
import Model from "../models/model";

/**
 * Unmarshal deserialized models.
 * @param {*} models
 */
export default function hydrate(models) {
  console.log({ func: hydrate.name, models });
  const hydrated = new Map();
  models.forEach(function (v, k) {
    Object.freeze;
    ModelFactory.createModel(v.modelName, v).then(function (model) {
      hydrated.set(k, {
        ...v,
        ...model,
        [Model.getKey("id")]: v.id,
        [Model.getKey("createTime")]: v.createTime,
        [Model.getKey("portFlow")]: v.portFlow,
      });
    });
  });
  return hydrated;
}
