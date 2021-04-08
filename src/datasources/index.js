"use strict";

/**
 * @typedef {import('../models').Model} Model
 */
import Transaction from ".";
import ModelFactory from "../models";
import * as adapters from "./adapters";
import {
  DataSourceFile,
  DataSourceMemory,
  DataSourceMongoDb,
} from "./adapters";

const adapter = process.env.DATASOURCE_ADAPTER || "DataSourceMemory";
const DataSource = adapters[adapter];

function getBaseClass(name) {
  if (name === "DataSourceMemory") {
    return DataSourceMemory;
  }
  if (name === "DataSourceMongoDb") {
    return DataSourceMongoDb;
  }
  return DataSourceFile;
}

const DataSourceFactory = (() => {
  let dataSources;

  function getCustomDataSource(ds, factory, name) {
    const spec = ModelFactory.getModelSpec(name);

    if (spec?.datasource) {
      const url = spec.datasource.url;
      const cacheSize = spec.datasource.cacheSize;
      const adapterFactory = spec.datasource.factory;
      // Can't use property key to select from adapters.
      const baseClass = getBaseClass(spec.datasource.baseClass);

      try {
        const adapter = adapterFactory(url, cacheSize, baseClass);
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

  /**
   * Manage transaction across models
   * @param {import("../models/index").ports} ports
   */
  async function executeTransaction(models, updates) {
    const transx = Transaction(models, updates);
    transx
      .update()
      .then(tx => tx.commit())
      .catch(e => console.log(e));
  }

  return Object.freeze({
    /**
     * Get `DataSource` singleton
     * @returns {import('./datasource').default} DataSource singleton
     */
    getDataSource,
    executeTransaction,
    close,
  });
})();

export default DataSourceFactory;
