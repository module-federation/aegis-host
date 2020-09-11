import DataSourceImpl from './datasource-impl'

const DataSourceFactory = (() => {
  let dataSources;

  function getDataSource(name) {
    if (!dataSources) {
      dataSources = new Map();
    }
    if (dataSources.has(name)) {
      return dataSources.get(name);
    }
    const newDs = new DataSourceImpl(new Map());
    dataSources.set(name, newDs);
    return newDs;
  }

  return Object.freeze({
    /**
     * Get `DataSource` singleton
     * @returns {import('./datasource').default} DataSource singleton
     */
    getDataSource
  });
})();

export default DataSourceFactory;