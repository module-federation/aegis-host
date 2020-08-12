/**
 * Simple abstract datasource
 */
export default class DataSource {
  async save(data) {
    throw new Error('abstract method not implemented');
  }
  /**
   * 
   * @param {*} id record id
   * @returns {*} record
   */
  async find(id) {
    throw new Error('abstract method not implemented');
  }
  /**
   * list records
   */
  async list() {
    throw new Error('abstract method not implemented');
  }

}