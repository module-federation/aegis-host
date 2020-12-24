'use strict';

/**
 * @typedef {import('../models').Model} Model
 */

import * as adapters from './adapters';

const adapter = process.env.DATASOURCE_ADAPTER || 'DataSourceMemory';

const DataSourceFactory = (() => {
  let dataSources;

  /**
   * Get the datasource for each model. Optionally inject logic 
   * for custom de/serialization and unmarshaling deserialized models

   * @param {string} name - model name
   * @param {import('../models/index').serializer[]} [serializers] - callbacks invoked during de/serialization
   * @param {function(Map<string,Model>):Map<string,Model} [hydrate] - unmarshalling deserialized objects
   */
  function getDataSource(name, serializers = {}, hydrate = (v) => v) {
    if (!dataSources) {
      dataSources = new Map();
    }
    if (dataSources.has(name)) {
      return dataSources.get(name);
    }
    const newDs = new adapters[adapter]({
      name,
      dataSource: new Map(),
      serializers,
      hydrate,
    });
    dataSources.set(name, newDs);
    return newDs;
  }

  return Object.freeze({
    /**
     * Get `DataSource` singleton
     * @returns {import('./datasource').default} DataSource singleton
     */
    getDataSource,
  });
})();

export default DataSourceFactory;
