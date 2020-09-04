import DataSource from "./datasource";

export default class DataSource1 extends DataSource {

  constructor(dataSource) {
    super(dataSource);
  }

  /**
   * @override
   */
  async save(id, data) {
    this._dataSource.set(id, data);
  }

  /**
   * @override
   */
  async find(id) {
    return this._dataSource.get(id);
  }

  /**
   * @override
   */
  async list() {
    return [...this._dataSource.entries()];
  }

}