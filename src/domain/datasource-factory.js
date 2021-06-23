"use strict";

/**
 * @typedef {import('.').Model} Model
 */
import ModelFactory from ".";
import * as adapters from "../datasources/adapters";

const adapter = process.env.DATASOURCE_ADAPTER || "DataSourceMemory";
const DefaultDataSource = adapters[adapter];

function getBaseClass(name) {
  if (name === "DataSourceFile") {
    return require("../datasources/adapters").DataSourceFile;
  }
  if (name === "DataSourceMongoDb") {
    return require("../datasources/adapters").DataSourceMongoDb;
  }
  return require("../datasources/adapters").DataSourceMemory;
}

/**
 * @todo handle all state same way
 * @name DataSourceFactory
 */
const DataSourceFactory = (() => {
  // References all DSes
  let dataSources;

  /**
   * Get datasource from model spec or return default for server.
   * @param {*} ds
   * @param {*} factory this factory
   * @param {*} name datasource name
   * @returns
   */
  function getSpecDataSource(ds, factory, name) {
    const spec = ModelFactory.getModelSpec(name);

    if (spec?.datasource) {
      const url = spec.datasource.url;
      const cacheSize = spec.datasource.cacheSize;
      const adapterFactory = spec.datasource.factory;
      const BaseClass = getBaseClass(spec.datasource.baseClass);

      try {
        const DataSource = adapterFactory(url, cacheSize, BaseClass);
        return new DataSource(ds, factory, name);
      } catch (error) {
        console.error(error);
      }
    }
    // use default datasource
    return new DefaultDataSource(ds, factory, name);
  }

  /**
   * Get the datasource for each model.
   * @param {string} name - model name
   * @param {boolean} cacheOnly - if true returns memory adapter, default is false
   */
  function getDataSource(name, cacheOnly = false) {
    if (!dataSources) {
      dataSources = new Map();
    }

    if (dataSources.has(name)) {
      return dataSources.get(name);
    }

    if (cacheOnly) {
      const BaseClass = getBaseClass("DataSourceMemory");
      const newDs = new BaseClass(new Map(), this, name);
      dataSources.set(name, newDs);
      return newDs;
    }

    const newDs = getSpecDataSource(new Map(), this, name);
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
