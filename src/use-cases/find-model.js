"use strict";

import executeCommand from './execute-command';
import fetchRelatedModels from './fetch-related-models';

/**
 * @typedef {Object} ModelParam
 * @property {String} modelName
 * @property {import('../datasources/datasource').default} repository
 * @property {import('../lib/observer').Observer} observer
 * @property {import('../models/index').ModelFactory} models
 * @property {...Function} handlers
 */

/**
 *
 * @param {ModelParam} param0
 */
export default function findModelFactory({ models, repository } = {}) {
  return async function findModel(id, query) {
    const model = await repository.find(id);

    if (!model) {
      throw new Error("no such id");
    }

    if (query) {
      const related = await fetchRelatedModels(models, model, query);
      if (related) {
        return related;
      }

      const command = await executeCommand(models, model, query);
      if (command) {
        return command;
      }
    }

    return model;
  };
}
