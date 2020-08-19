/**
 * Simple abstract datasource
 */
export default class DataSource {
  async save(id, data) {
    throw new Error('abstract method not implemented');
  }
  /**
   * 
   * @param {*} id record id
   * @returns {Promise<any>} record
   */
  async find(id) {
    throw new Error('abstract method not implemented');
  }
  /**
   * list records
   * @returns {Promise<any>} records
   */
  async list() {
    throw new Error('abstract method not implemented');
  }

}