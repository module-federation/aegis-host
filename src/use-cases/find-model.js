"use strict";

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../lib/observer').Observer} observer
 * @property {...Function} handlers
 */

/**
 *
 * @param {ModelParam} param0
 */
export default function findModelFactory({ repository } = {}) {
  return async function findModel(id, query) {
    const model = await repository.find(id);

    if (!model) {
      throw new Error("no such id");
    }

    console.log({
      func: findModel.name,
      id,
      query,
      relation: query.relation,
      relfunc: model[query.relation],
    });

    if (query && model[query.relation]) {
      const related = await model[query.relation]();
      
      if (related) {
        console.log({ func: findModel.name, result: related });
        return { model, related };
      }
    }

    return model;
  };
}
