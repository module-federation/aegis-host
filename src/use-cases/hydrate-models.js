'use strict';

import ModelFactory from '../models';
import Model from '../models/model';

export default function hydrate(models) {
  console.log({ func: hydrate.name, models });
  const hydrated = new Map();
  models.forEach(function (v, k) {
    ModelFactory.createModel(v.modelName, v).then(function (model) {
      hydrated.set(k, {
        ...model,
        ...v,
        [Model.getKey('id')]: v.id,
        [Model.getKey('createTime')]: v.createTime,
        [Model.getKey('modelName')]: v.modelName,
        [Model.getKey('portFlow')]: v.portFlow,
      });
    });
  });
  return hydrated;
}
