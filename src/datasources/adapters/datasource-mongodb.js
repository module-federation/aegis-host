"use strict";

const MongoClient = require("mongodb").MongoClient;
const DataSourceMemory = require("./datasource-memory").DataSourceMemory;

const url = process.env.MONGODB_URL || "mongodb://localhost:27017";
const cacheSize = Number(process.env.CACHE_SIZE) || 300;

/**
 * MongoDB adapter extends in-memory datasource to support caching.
 * The cache is always updated first, which allows the system to run
 * even when the database is offline.
 */
export class DataSourceMongoDb extends DataSourceMemory {
  constructor(datasource, factory, name) {
    super(datasource, factory, name);
    this.url = url;
    this.cacheSize = cacheSize;
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
      .catch(e => console.error(e));
  }

  async connectDb() {
    if (!this.client) {
      this.client = await MongoClient.connect(this.url, {
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
      const cursor = this.collection.find().limit(this.cacheSize);
      cursor.forEach(
        async model => await super.save(model.id, this.hydrate(model))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async checkConnection(error) {
    try {
      console.error("check connection on error", error);
      if (!this.client || !this.client.isConnected) {
        await this.connectDb();
        this.setCollection();
        return this.flush();
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
   * Check the cache first.
   * @overrid
   * @param {*} id - `Model.id`
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
   * Save to the cache first, then the db.
   * Wait for both functions to complete. We
   * keep running even if the db is offline.
   *
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
   * @param {{key1:string, keyN:string}} filter - e.g. http query
   * @param {boolean} cached - use the cache if true, otherwise go to db.
   */
  async list(filter = null, cached = true) {
    try {
      if (cached) {
        //console.log("cache size", this.dataSource.size);
        return super.list(filter);
      }
      return await this.collection.find().toArray();
    } catch (error) {
      await this.checkConnection(error);
    }
  }

  /**
   * Delete from db, then cache.
   * If db fails, keep it cached.
   *
   * @override
   * @param {*} id
   */
  async delete(id) {
    try {
      await Promise.all([
        this.collection.deleteOne({ _id: id }),
        super.delete(id),
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Flush the cache to disk.
   */
  flush() {
    try {
      [...this.dataSource.values()].reduce(
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
