"use strict";

/**
 * @typedef {import('../models').Model} Model
 */

import * as adapters from "./adapters";

const adapter = process.env.DATASOURCE_ADAPTER || "DataSourceMemory";
const DataSource = adapters[adapter];

const DataSourceFactory = (() => {
  let dataSources;

  /**
   * Get the datasource for each model. Optionally inject logic 
   * for custom de/serialization and unmarshaling deserialized models
   * @param {string} name - model name
   * @param {import('../models/index').serializer[]} [serializers] - callbacks invoked during de/serialization
   * @param {function(Map<string,Model>):Map<string,Model} [hydrate] - unmarshalling deserialized objects
   */
  function getDataSource(name) {
    if (!dataSources) {
      dataSources = new Map();
    }
    if (dataSources.has(name)) {
      return dataSources.get(name);
    }
    const newDs = new DataSource(new Map(), this);
    dataSources.set(name, newDs);
    return newDs;
  }

  function close() {
    dataSources.forEach(ds => ds.close());
  }

  return Object.freeze({
    /**
     * Get `DataSource` singleton
     * @returns {import('./datasource').default} DataSource singleton
     */
    getDataSource,
    close
  });
})();

export default DataSourceFactory;
