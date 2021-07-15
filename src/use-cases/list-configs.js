"use strict";

/**
 * @param {{
 * models:import("../domain/model").Model,
 * data:import("../domain/datasource-factory").DataSourceFactory
 * }} options
 */
export default function listConfigsFactory({ models, data } = {}) {
  return async function listConfigs(query) {
    console.log(query);
    if (query && query.details === "data") {
      return JSON.stringify(data.listDataSources().map(([k]) => [k]));
    }
    return models.getModelSpecs().filter(spec => !spec.isCache);
  };
}
