/**
 * @callback listModels
 * @param {{key1:string, keyN:string}} query
 * @returns {Promise<Array<import("../models/model").Model)>>}
 *
 * @param {import('../datasources/datasource').default} repository
 * @returns {listModels}
 */
export default function listModelsFactory({ repository } = {}) {
  return async function listModels(query) {
    console.debug("query", query);
    return repository.list(query);
  };
}
