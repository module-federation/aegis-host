async function getCountByDateRange(range, repository) {
  return {
    count: (await repository.list(null, false)).length,
  };
}

/**
 * @callback listModels
 * @param {{key1:string, keyN:string}} query
 * @returns {Promise<Array<import("../models/model").Model)>>}
 *
 * @param {{repository:import('../datasources/datasource').default}}
 * @returns {listModels}
 */
export default function listModelsFactory({ repository } = {}) {
  return async function listModels(query) {
    if (query?.count) {
      if (
        [
          "today",
          "thisWeek",
          "thisMonth",
          "yesterday",
          "lastWeek",
          "lastMonth",
        ].includes(query.count)
      ) {
        return getCountByDateRange(query.count, repository);
      }
      return {
        count: (await repository.list(null, false)).length,
      };
    }
    return repository.list(query);
  };
}
