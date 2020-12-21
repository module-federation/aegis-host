import fs from 'fs';
import path from 'path';
import DataSource from './datasource';
import { serialize, deserialize } from '../lib/serializer';

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

/**
 * Persistent storage on filesystem
 */
export class DataSourceFile extends DataSourceMemory {
  constructor({
    dataSource,
    directory = __dirname,
    replacer = (key, value) => value,
    reviver = (key, value) => value,
    name,
  }) {
    super({ dataSource });
    this.replacer = this.replace(replacer);
    this.reviver = this.revive(reviver);
    this.file = path.resolve(directory, name.concat('.json'));
    // this.dataSource = this.readFile();
  }

  replace(callback) {
    return function (key, value) {
      if (value) {
        const serialized = serialize(key, value);
        return callback('', serialized.value);
      }
    };
  }

  revive(callback) {
    return function (key, value) {
      const deserialized = deserialize(key, value);
      return callback('', deserialized.value);
    };
  }

  writeFile() {
    const dataStr = JSON.stringify([...this.dataSource], this.replacer);
    console.log(dataStr);
    fs.writeFileSync(this.file, dataStr);
  }

  /**
   *
   */
  readFile() {
    if (fs.existsSync(this.file)) {
      const models = fs.readFileSync(this.file, 'utf-8');
      if (models) {
        return new Map(JSON.parse(models, this.reviver));
      }
    }
    return new Map();
  }

  /**
   * @override
   * @param {*} id
   */
  async delete(id) {
    await super.delete(id);
    this.writeFile();
  }

  /**
   * @overrides
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    const ds = await super.save(id, data);
    this.writeFile();
    return ds;
  }
}
