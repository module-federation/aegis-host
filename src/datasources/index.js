import DataSource1 from './datasource1'
import DataSource2 from './datasource2'

const DataSourceFactory = (() => {
  let dataSource1;
  let dataSource2;

  function createDataSource1() {
    return new DataSource1();
  }

  function createDataSource2() {
    return new DataSource2();
  }

  return Object.freeze({
    /**
     * Get `DataSource1` singleton
     * @returns {import('./datasource').default} DataSource1 singleton
     */
    getDataSource1: function () {
      if (!dataSource1) {
        dataSource1 = createDataSource1();
      }
      return dataSource1;
    },
    /**
     * Get `DataSource2` singleton
     * @returns {import('./datasource').default} DataSource2 singleton
     */
    getDataSource2: function () {
      if (!dataSource2) {
        dataSource2 = createDataSource2();
      }
      return dataSource2;
    }
  });
})();

export default DataSourceFactory;