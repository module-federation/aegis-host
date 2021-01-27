"use strict";

const MongoClient = require("mongodb").MongoClient;
const DataSourceMemory = require("./datasource-memory").DataSourceMemory;

const url = process.env.MONGODB_URL || "mongodb://localhost:27017";
const cacheSize = Number(process.env.CACHE_SIZE) || 300;

/**
 * MongoDB adapter extends in-memory datasource to support caching
 */
export class DataSourceMongoDb extends DataSourceMemory {
  constructor(datasource, factory, name) {
    super(datasource, factory, name);
  }

  /**
   * @override
   * @param {{
   *  hydrate:function(Map<string,import("../../models").Model>),
   *  serializer:import("../../lib/serializer").Serializer
   * }} options
   */
  load({ hydrate, serializer }) {
    this.hydrate = hydrate;
    this.serializer = serializer;

    this.connectDb()
      .then(() => this.setCollection())
      .then(() => this.loadModels())
      .catch((e) => console.log(e));
  }

  async connectDb() {
    if (!this.client) {
      this.client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      if (!this.client) {
        throw new Error("connection to mongodb failed");
      }
    }
  }

  setCollection() {
    this.collection = this.client.db(this.name).collection(this.name);
  }

  async loadModels() {
    const models = this.collection.find().limit(cacheSize);
    models.forEach((model) => {
      super.save(model.id, this.hydrate(model));
    });
  }

  /**
   * @override
   * @param {*} id
   */
  async find(id) {
    try {
      const cached = super.find(id);

      if (!cached) {
        const model = await this.collection.findOne({ _id: id });
        if (!model) {
          console.warn("document not found in mongodb", id);
          return null;
        }
        return super.save(id, this.hydrate(model));
      }

      return cached;
    } catch (error) {
      console.error(error);
    }
  }

  serialize(data) {
    if (this.serializer) {
      return JSON.stringify(data, this.serializer.serialize);
    }
    return JSON.stringify(data);
  }

  /**
   * @override
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    try {
      super.save(id, data);

      const model = JSON.parse(this.serialize(data));

      await this.collection.replaceOne(
        { _id: id },
        { ...model, _id: id },
        { upsert: true }
      );

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @override
   * @param {boolean} cached
   */
  async list(query = null, cached = true) {
    try {
      if (cached) {
        console.log("cache size", this.dataSource.size);
        return super.list(query);
      }
      return await this.collection.find().toArray();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @override
   * @param {*} id
   */
  async delete(id) {
    try {
      super.delete(id);
      await this.collection.deleteOne({ _id: id });
    } catch (error) {
      console.error(error);
    }
  }

  close() {
    this.client.close();
  }
}
