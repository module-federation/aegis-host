import fs from "fs";
import path from "path";
import { DataSourceMemory } from "./datasource-memory";

const directoryName = process.env.DATASOURCE_FILE_DIRECTORY || __dirname;
const directoryPath = path.resolve(__dirname, directoryName) || __dirname;

/**
 * Persistent storage on filesystem
 */
export class DataSourceFile extends DataSourceMemory {
  /**
   * @param {Set} dataSource
   */
  constructor(dataSource, factory, name) {
    super(dataSource, factory, name);
  }

  /**
   *
   * @param {{
   *  hydrate:function(Map<string,import("../../models/model").Model>),
   *  serializer:import("../../lib/serializer").Serializer,
   * }} param0
   */
  async load({ hydrate, serializer }) {
    this.file = path.join(directoryPath, this.name.concat(".json"));
    this.serializer = serializer;
    this.dataSource = this.readFile(hydrate);
  }

  replace(key, value) {
    if (value && this.serializer) {
      return this.serializer.serialize(key, value);
    }
    return value;
  }

  revive(key, value) {
    if (value && this.serializer) {
      return this.serializer.deserialize(key, value);
    }
    return value;
  }

  writeFile() {
    const dataStr = JSON.stringify([...this.dataSource], this.replace);
    fs.writeFileSync(this.file, dataStr);
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
    this.writeFile();
  }
}
