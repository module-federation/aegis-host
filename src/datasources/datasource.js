/**
 * Abstraction
 */
export default class DataSource {

  constructor(dataSource) {
    this._dataSource = dataSource;
  }
  /**
   * Upsert model instance
   * @param {*} id 
   * @param {*} data 
   */
  async save(id, data) {
    throw new Error('abstract method not implemented');
  }

  /**
   * Find model instance by ID 
   * @param {*} id record id
   * @returns {Promise<any>} record
   */
  async find(id) {
    throw new Error('abstract method not implemented');
  }

  /**
   * list model instances
   * @returns {Promise<any[]>}
   */
  async list() {
    throw new Error('abstract method not implemented');
  }

}