"use strict";

var assert = require("assert");

import addModelFactory from "../../src/use-cases/add-model";
import postModelFactory from "../../src/adapters/controllers/post-model";

import DataSourceFactory from "../../src/domain/datasource-factory";
import ModelFactory from "../../src/domain";
import ObserverFactory from "../../src/domain/observer";
import hash from "../../src/domain/util/hash";

describe("Controllers", function () {
  describe("postModel()", function () {
    it("should add new model", async function () {
      ModelFactory.registerModel({
        modelName: "ABC",
        factory: ({ a }) => ({ a, b: "c" }),
        endpoint: "abcs",
        dependencies: {},
      });
      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        "ABC",
        model => ({ model })
      );
      const addModel = await addModelFactory({
        modelName: "ABC",
        models: ModelFactory,
        repository: DataSourceFactory.getDataSource("ABC"),
        observer: ObserverFactory.getInstance(),
      });
      const resp = await postModelFactory(addModel)({
        body: { a: "a" },
        headers: { "User-Agent": "test" },
        ip: "127.0.0.1",
        log: ()=>1,
      });
      console.log("resp.status", resp.statusCode);
      assert.strictEqual(resp.statusCode, 201);
    });
  });
});
