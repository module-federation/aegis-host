"use strict";

var assert = require("assert");

import addModelFactory from "@module-federation/aegis/lib/use-cases/add-model";
import postModelFactory from "@module-federation/aegis/lib/adapters/controllers/post-model";

import DataSourceFactory from "@module-federation/aegis/lib/domain/datasource-factory";
import ModelFactory from "@module-federation/aegis/lib/domain";
import ObserverFactory from "@module-federation/aegis/lib/domain/observer";
import hash from "@module-federation/aegis/lib/domain/util/hash";

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
