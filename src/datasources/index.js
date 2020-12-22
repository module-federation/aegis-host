'use strict';

import * as adapters from './adapters';

const adapter = process.env.DATASOURCE_ADAPTER || 'DataSourceMemory';

const DataSourceFactory = (() => {
  let dataSources;

  /**
   * Get the datasource for each model
   * @param {string} name - model name
   * @param {function(Map<string,import('../models').Model):Map<string, import('../models').Model} [hydrate] - unmarshal serialized objects
   */
  function getDataSource(name, hydrate = (o) => o) {
    if (!dataSources) {
      dataSources = new Map();
    }
    if (dataSources.has(name)) {
      return dataSources.get(name);
    }
    const newDs = new adapters[adapter]({
      name,
      dataSource: new Map(),
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
