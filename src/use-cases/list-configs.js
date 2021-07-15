"use strict";

/**
 * @param {{
 * models:import("../domain/model").Model,
 * data:import("../domain/datasource-factory").DataSourceFactory
 * }} options
 */
export default function listConfigsFactory({ models, data } = {}) {
  return async function listConfigs(query) {
    if (query && query.details === "data") {
      return JSON.stringify(data.listDataSources().map(([k]) => k));
    } else if (query) {
      const prop = Object.keys(query)[0];
      const val = query[prop];
      return models
        .getModelSpecs()
        .filter(spec => !(spec[prop] && Boolean(val)));
    }
    return models.getModelSpecs();
  };
}
