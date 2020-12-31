import fs from "fs";
import path from "path";
import { DataSourceMemory } from "./datasource-memory";
import Serializer from "../../lib/serializer";

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
   *  loadModels:function(*):import('../models').Model,
   *  name:string
   * }} param0
   */
  constructor({
    dataSource,
    serializers = [],
    directory = __dirname,
    loadModels = (value) => value,
    name,
  }) {
    super({
      dataSource
    });
    this.file = path.resolve(directory, name.concat(".json"));
    if (serializers.length > 0) {
      Serializer.addSerializer(serializers);
    }
    this.dataSource = this.readFile(loadModels);
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
  readFile(loadModels) {
    if (fs.existsSync(this.file)) {
      const models = fs.readFileSync(this.file, "utf-8");
      if (models) {
        return loadModels(new Map(JSON.parse(models, this.revive)));
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