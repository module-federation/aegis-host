import DataSource from './datasource';
import fs from 'fs';
import path from 'path';
import Model from 'Model';

/**
 * Temporary in-memory storage
 */
export class DataSourceMem extends DataSource {
  constructor({ dataSource }) {
    super({ dataSource });
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
    return [...this._dataSource.values()];
  }

  /**
   * @override
   */
  async delete(id) {
    this._dataSource.delete(id);
  }
}

/**
 * Persist data on disk
 */
export class DataSourceDisk extends DataSourceMem {
  constructor({ dataSource, name }) {
    super({ dataSource });
    this._name = name;
    this._dataSource = this.deserialize();
  }

  serialize() {
    const dataStr = JSON.stringify(Array.from(this._dataSource.entries()));
    fs.writeFileSync(this._name.concat('.json'), dataStr);
  }

  /**
   *
   */
  deserialize() {
    const file = path.resolve(__dirname, this._name.concat('.json'));
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, {
        BufferEncoding: 'utf-8',
        flag: 'r',
      });
      if (data) {
        const models = JSON.parse(data);
        await models.forEach((model) =>
         Model.create({ name: this._name, args: model });
      }

      if (modelData) {
        return new Map(modelData);
      }
      console.warn('no models found');
    }
    return new Map();
  }

  /**
   * @override
   * @param {*} id
   */
  async delete(id) {
    await super.delete(id);
    this.serialize();
  }

  /**
   * @overrides
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    const ds = await super.save(id, data);
    this.serialize();
    return ds;
  }
}
we;
