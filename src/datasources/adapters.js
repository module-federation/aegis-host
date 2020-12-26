import fs from "fs";
import path from "path";
import DataSource from "./datasource";
import Serializer from "../lib/serializer";

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
  /**
   *
   * @param {{
   *  dataSource:Map<string,import('../models').Model>
   *  serializers:import('../models/index').serializer[]
   *  directory:string
   *  hydrate:function(*):import('../models').Model,
   *  name:string
   * }} param0
   */
  constructor({
    dataSource,
    serializers = [],
    directory = __dirname,
    hydrate = (value) => value,
    name,
  }) {
    super({ dataSource });
    this.file = path.resolve(directory, name.concat(".json"));
    if (serializers.length > 0) {
      Serializer.addSerializer(serializers);
    }
    this.dataSource = this.readFile(hydrate);
  }

  replace(key, value) {
    if (value) {
      return Serializer.serialize(key, value);
    }
  }

  revive(key, value) {
    if (value) {
      return Serializer.deserialize(key, value);
    }
  }

  writeFile(async = true) {
    const dataStr = JSON.stringify([...this.dataSource], this.replace);
    if (async) {
      fs.writeFile(this.file, dataStr, (err) => console.error(err));
    } else {
      fs.writeFileSync(this.file, dataStr);
    }
  }

  /**
   *
   */
  readFile(hydrate) {
    if (fs.existsSync(this.file)) {
      const models = fs.readFileSync(this.file, "utf-8");
      if (models) {
        return hydrate(new Map(JSON.parse(models, this.revive)));
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

  close() {
    this.writeFile(false);
  }
}
