'use strict'

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
  return async function findModel(id) {
    const model = await repository.find(id);
    if (!model) {
      throw new Error('no such id');
    }
    return model;
  }
}