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
      .then(this.setCollection)
      .then(this.loadModels)
      .catch(e => console.log(e));
  }

  async connectDb() {
    if (!this.client) {
      this.client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      if (!this.client || !this.client.isConnected) {
        console.error("can't connect to db - using memory", error);
      }
    }
  }

  setCollection() {
    try {
      this.collection = this.client.db(this.name).collection(this.name);
    } catch (error) {
      console.error("error setting collection", error);
    }
  }

  async loadModels() {
    try {
      const cursor = this.collection.find().limit(cacheSize);
      cursor.forEach(model => {
        super.save(model.id, this.hydrate(model));
      });
    } catch (error) {
      console.error(error);
    }
  }

  checkConnection(error) {
    try {
      console.error("check connection on error", error);
      if (!this.client || !this.client.isConnected) {
        return this.connectDb().then(this.setCollection);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async findDb(id) {
    const model = await this.collection.findOne({ _id: id });
    if (!model) {
      await this.checkConnection("document not found");
      return model;
    }
    return super.save(id, this.hydrate(model));
  }

  /**
   * @overrid
   * @param {*} id
   */
  async find(id) {
    try {
      const cached = await super.find(id);
      if (!cached) {
        return this.findDb(id);
      }
      return cached;
    } catch (error) {
      await this.checkConnection(error);
    }
  }

  serialize(data) {
    if (this.serializer) {
      return JSON.stringify(data, this.serializer.serialize);
    }
    return JSON.stringify(data);
  }

  async saveDb(id, data) {
    const clone = JSON.parse(this.serialize(data));
    await this.collection.replaceOne(
      { _id: id },
      { ...clone, _id: id },
      { upsert: true }
    );
    return data;
  }

  /**
   * @override
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    try {
      await Promise.allSettled([super.save(id, data), this.saveDb(id, data)]);
      return data;
    } catch (error) {
      await this.checkConnection(error);
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
      await this.checkConnection(error);
    }
  }

  /**
   *
   * @override
   * @param {*} id
   */
  async delete(id) {
    await Promise.allSettled([
      super.delete(id),
      this.collection.deleteOne({ _id: id }),
    ]).catch(error => this.checkConnection(error));
  }

  /**
   * Flush the cache to disk.
   */
  flush() {
    try {
      this.dataSource
        .values()
        .reduce(
          (data, model) => data.then(this.saveDb(model.getId())),
          Promise.resolve()
        );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Process terminating, flush cache, close connections.
   * @override
   */
  close() {
    this.flush();
    this.client.close();
  }
}
