"use strict";

import async from "../../lib/async-error";

const MongoClient = require("mongodb").MongoClient;
const DataSourceFile = require("./datasource-file").DataSourceFile;

const url = process.env.MONGODB_URL || "mongodb://localhost:27017";
const cacheSize = Number(process.env.CACHE_SIZE) || 300;

export class DataSourceMongoDb extends DataSourceFile {
  constructor(datasource, factory, name) {
    super(datasource, factory, name);
  }

  /**
   * @override
   * @param {{
   *  hydrate:function(Map<string,import("../../models").Model>),
   *  serializer:function(*,*):*
   * }} options
   */
  load({ hydrate, serializer }) {
    this.hydrate = hydrate;
    this.serializer = serializer;

    this.connectDb()
      .then(() => this.loadModels())
      .then(() => console.log("db loaded"))
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

  async loadModels() {
    try {
      this.collection = this.client.db("fedmon").collection(this.name);
      const models = this.collection.find().limit(cacheSize);
      models.forEach((model) => {
        const hydrated = this.hydrate(model);
        //console.log(hydrated);
        this.dataSource.set(model.id, hydrated);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @override
   * @param {*} id
   */
  async find(id) {
    try {
      const cached = this.dataSource.get(id);

      if (!cached) {
        const model = await this.collection.findOne({ _id: id });
        return this.dataSource.set(id, this.hydrate(model));
      }

      return cached;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @override
   * @param {*} id
   * @param {*} data
   */
  async save(id, data) {
    try {
      const model = JSON.parse(JSON.stringify(data, this.replace), this.revive);

      await this.collection.replaceOne(
        { _id: id },
        { ...model, _id: id },
        { upsert: true }
      );

      return this.dataSource.set(id, data).get(id);
    } catch (error) {
      console.error(error);
    }
  }

  async list(cached = false) {
    if (cached) {
      return [...this.dataSource.values()];
    }
    return this.collection.find().toArray();
  }

  /**
   * @override
   * @param {*} id
   */
  async delete(id) {
    try {
      await this.collection.deleteOne({ _id: id });
      this.dataSource.delete(id);
    } catch (error) {
      console.error(error);
    }
  }

  close() {
    this.client.close();
  }
}
