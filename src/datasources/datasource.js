/**
 * Abstract datasource class
 */
export default class DataSource {
  constructor(dataSource, factory, name) {
    this.dataSource = dataSource;
    this.factory = factory;
    this.name = name;
  }
  /**
   * Upsert model instance
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    throw new Error("abstract method not implemented");
  }

  /**
   * Find model instance by ID
   * @param {*} id record id
   * @returns {Promise<any>} record
   */
  async find(id) {
    throw new Error("abstract method not implemented");
  }

  /**
   * list model instances
   * @param {boolean} [cached] - list cached items, default is true
   * @returns {Promise<any[]>}
   */
  async list(cached = true) {
    throw new Error("abstract method not implemented");
  }

  async delete(id) {
    throw new Error("abstract method not implemented");
  }

  /**
   *
   * @param {*} options
   */
  load(options) {}

  /**
   *
   */
  getFactory() {
    return this.factory;
  }

  /**
   *
   */
  getCacheSize() {
    return this.dataSource.size;
  }

  /**
   *
   */
  close() {}
}
