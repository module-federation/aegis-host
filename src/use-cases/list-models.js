async function getCountByDateRange(range, repository) {
  // TODO: implement
  return {
    count: (await repository.list()).length,
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
          "thisYear",
          "yesterday",
          "lastWeek",
          "lastMonth",
          "lastYear"
        ].includes(query.count)
      ) {
        return getCountByDateRange(query.count, repository);
      }
      return {
        count: (await repository.list()).length,
      };
    }
    return repository.list(query);
  };
}
