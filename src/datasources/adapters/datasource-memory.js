import DataSource from "../datasource";

/**
 * Temporary in-memory storage
 */
export class DataSourceMemory extends DataSource {
  constructor({ dataSource }) {
    super({ dataSource });
  }

  /**
   * @override
   */
  async save(id, data) {
    this.dataSource.set(id, data);
  }

  /**
   * @override
   */
  async find(id) {
    return this.dataSource.get(id);
  }

  /**
   * @override
   */
  async list() {
    return [...this.dataSource.values()];
  }

  /**
   * @override
   */
  async delete(id) {
    this.dataSource.delete(id);
  }
}
