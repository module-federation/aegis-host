"use strict";

/** @typedef {import('.').Model} Model */

import ModelFactory from ".";
import * as adapters from "../adapters/datasources";
import config from "../adapters/datasources";

const defaultAdapter = process.env.DATASOURCE_ADAPTER || config.MEMORYADAPTER;
const DefaultDataSource = adapters[defaultAdapter];

/**
 * @todo handle all state same way
 * @typedef {{getDataSource:function(string):import("./datasource").default,listDataSources:Map[]}} DataSourceFactory
 * @type {DataSourceFactory}
 */
const DataSourceFactory = (() => {
  // References all DSes
  let dataSources;

  /**
   * @method
   * @param {*} name
   * @returns
   */
  function hasDataSource(name) {
    return dataSources.has(name);
  }

  function listDataSources() {
    return [...dataSources];
  }

  /**
   * Get datasource from model spec or return default for server.
   * @param {*} ds
   * @param {*} factory this factory
   * @param {*} name datasource name
   * @returns
   */
  function getSpecDataSource(ds, factory, name) {
    const spec = ModelFactory.getModelSpec(name);

    if (spec && spec.datasource) {
      const url = spec.datasource.url;
      const cacheSize = spec.datasource.cacheSize;
      const adapterFactory = spec.datasource.factory;
      const BaseClass = config.getBaseClass(spec.datasource.baseClass);

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
      const MemoryDs = config.getBaseClass(config.MEMORYADAPTER);
      const newDs = new MemoryDs(new Map(), this, name);
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
     * @method
     * @returns {import('./datasource').default} DataSource singleton
     */
    getDataSource,
    hasDataSource,
    listDataSources,
    close,
  });
})();

export default DataSourceFactory;
