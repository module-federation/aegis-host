"use strict";

function roughSizeOfObject(...objects) {
  let bytes = 0;

  objects.forEach(object => {
    const objectList = [];
    const stack = [object];
    console.log(objects);
    console.log(stack.length);
    while (stack.length) {
      var value = stack.pop();

      if (typeof value === "boolean") {
        bytes += 4;
      } else if (typeof value === "string") {
        bytes += value.length * 2;
      } else if (typeof value === "number") {
        bytes += 8;
      } else if (
        typeof value === "object" &&
        objectList.indexOf(value) === -1
      ) {
        objectList.push(value);

        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
  });

  return bytes;
}

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

  async clusterSave(id, data) {}

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
  async list(query = null, cached = true) {
    throw new Error("abstract method not implemented");
  }

  listSync(query) {}

  async delete(id) {
    throw new Error("abstract method not implemented");
  }

  async clusterDelete(id) {}
  /**
   *
   * @param {*} options
   */
  async load(options) {}

  getFactory() {
    return this.factory;
  }

  /**
   *
   */
  getCacheSize() {
    return this.dataSource.size;
  }

  getCacheSizeBytes() {
    return this.dataSource.size * roughSizeOfObject([...this.dataSource][0][1]);
  }

  /**
   *
   */
  close() {}
}
