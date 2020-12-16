import * as adapters from './adapters';

const adapter = process.env.DATASOURCE_ADAPTER || 'DataSourceDisk';

const DataSourceFactory = (() => {
  let dataSources;

  function getDataSource(name) {
    if (!dataSources) {
      dataSources = new Map();
    }
    if (dataSources.has(name)) {
      return dataSources.get(name);
    }
    const newDs = new adapters[adapter]({ name, dataSource: new Map() });
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
