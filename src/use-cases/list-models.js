"use strict";

const DateFunctions = {
  today: list =>
    list.filter(m => new Date(m.createTime).getDate() === new Date().getDate())
      .length,
  yesterday: list =>
    list.filter(
      m => new Date(m.createTime).getDate() === new Date().getDate() - 1
    ).length,
  thisMonth: list =>
    list.filter(
      m => new Date(m.createTime).getMonth() === new Date().getMonth()
    ).length,
  lastMonth: list =>
    list.filter(
      m => new Date(m.createTime).getMonth() === new Date().getMonth() - 1
    ).length,
};

/**
 *
 * @param {*} query
 * @param {import("../datasources/datasource").default} repository
 * @returns
 */
async function parseQuery(query, repository) {
  if (query?.count) {
    if (typeof query.count === "number") {
      return repository.list(query);
    }
    const dateFunc = DateFunctions[query.count];

    if (dateFunc) {
      const list = await repository.list();
      return {
        count: dateFunc(list),
      };
    }

    const searchTerms = query.count.split(":");

    if (searchTerms.length > 1) {
      const filter = { [searchTerms[0]]: searchTerms[1] };
      const filteredList = await repository.list(filter);

      return {
        ...filter,
        count: filteredList.length,
      };
    }

    return {
      total: (await repository.list(null, false)).length,
      cached: repository.getCacheSize(),
      bytes: repository.getCacheSizeBytes(),
    };
  }
  return repository.list(query);
}

/**
 * @callback listModels
 * @param {{key1:string, keyN:string}} query
 * @returns {Promise<Array<import("../models/model").Model)>>}
 *
 * @param {{repository:import('../datasources/datasource').default}}
 * @returns {listModels}
 */
export default function makeListModels({ repository } = {}) {
  return async function listModels(query) {
    return parseQuery(query, repository);
  };
}
