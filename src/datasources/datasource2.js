import DataSource from "./datasource";

export default class DataSource2 extends DataSource {

  constructor(dataSource) {
    super(dataSource);
  }

  async save(id, data) {
    this._dataSource.set(id, data);
  }

  async find(id) {
    return this._dataSource.get(id);
  }

  async list() {
    return [...this._dataSource.entries()];
  }

}