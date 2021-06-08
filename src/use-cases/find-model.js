"use strict";

import executeCommand from "./execute-command";
import fetchRelatedModels from "./fetch-related-models";

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../models/observer').Observer} observer
 * @property {import('../models/index').ModelFactory} models
 * @property {...Function} handlers
 */

/**
 * @callback findModel
 * @param {string} id
 * @param {{key1:string,keyN:string}} query
 * @returns {Promise<import("../models/model").Model>}
 *
 * @param {ModelParam} param0
 * @returns {findModel}
 */
export default function makeFindModel({ repository } = {}) {
  return async function findModel(id, query) {
    const model = await repository.find(id);

    if (!model) {
      throw new Error("no such id");
    }

    if (query?.relation) {
      const related = await fetchRelatedModels(model, query.relation);
      if (related) {
        return related;
      }
    }

    if (query?.command) {
      const result = await executeCommand(model, query.command, "read");
      if (result) {
        return result;
      }
    }

    return model;
  };
}
