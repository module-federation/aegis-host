"use strict";

import DataSource from "../datasource";
const clusterEnabled = /true/i.test(process.env.CLUSTER_ENABLED);

/**
 * Temporary in-memory storage
 */
export class DataSourceMemory extends DataSource {
  constructor(dataSource, factory, name) {
    super(dataSource, factory, name);
  }

  /**
   * @override
   */
  async save(id, data) {
    return this.dataSource.set(id, data).get(id);
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
  async list(query) {
    return this.listSync(query);
  }

  /**
   * @override
   * @param {{key1,keyN}} query
   * @returns
   */
  listSync(query) {
    const values = [...this.dataSource.values()];

    if (query) {
      const keys = Object.keys(query);

      if (keys.length > 0) {
        return values.filter(v =>
          keys.every(k => (v[k] ? query[k] === v[k] : false))
        );
      }
    }
    return values;
  }

  /**
   * @override
   */
  async delete(id) {
    this.dataSource.delete(id);
  }

  async clusterDelete(id) {
    this.dataSource.delete(id);
  }
}
