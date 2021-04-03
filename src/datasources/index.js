"use strict";

/**
 * @typedef {import('../models').Model} Model
 */

import ModelFactory from "../models";
import * as adapters from "./adapters";
import { DataSourceMemory } from "./adapters";

const adapter = process.env.DATASOURCE_ADAPTER || "DataSourceMemory";
const DataSource = adapters[adapter];

const DataSourceFactory = (() => {
  let dataSources;

  function getCustomDataSource(ds, factory, name) {
    const spec = ModelFactory.getModelSpec(name);

    if (spec?.datasource) {
      const url = spec.datasource.url;
      const cacheSize = spec.datasource.cacheSize;
      const adapterFactory = spec.datasource.factory;

      try {
        const adapter = adapterFactory(url, DataSourceMemory, cacheSize);
        return new adapter(ds, factory, name);
      } catch (error) {
        console.error(error);
      }
    }
    // use default datasource
    return new DataSource(ds, factory, name);
  }

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

    const newDs = getCustomDataSource(new Map(), this, name);
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
    close,
  });
})();

export default DataSourceFactory;
