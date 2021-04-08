"use strict";

var assert = require("assert");
const {
  fromSymbol,
  toSymbol,
  fromTimestamp,
  withSerializers,
  withDeserializers,
} = require("../../src/models/mixins");

describe("Mixins", function () {
  it("should return strings in place of symbols", function () {
    const ID = Symbol("id");
    const CREATETIME = Symbol("createTime");

    const keyMap = {
      id: ID,
      createTime: CREATETIME,
    };
    var time = new Date().getTime();
    var obj1 = {
      [ID]: "123",
      [CREATETIME]: time,
      id: "123",
      createTime: time,
    };
    // console.log("obj1", obj1);
    var obj2 = fromSymbol(keyMap)(obj1);
    // console.log("obj2", obj2);
    assert.strictEqual(JSON.stringify(obj1), JSON.stringify(obj2));
  });
  it("should return Symbols in place of strings", function () {
    const ID = Symbol("id");
    const CREATETIME = Symbol("createTime");

    const keyMap = {
      id: ID,
      createTime: CREATETIME,
    };
    var time = new Date().getTime();
    var obj1 = {
      id: "123",
      createTime: time,
    };
    // console.log("obj1", obj1);
    var obj2 = toSymbol(keyMap)(obj1);
    // console.log("obj2", obj2);
    assert.strictEqual(JSON.stringify(obj1), JSON.stringify(obj2));
  });
  it("should return utc in place of timestamp", function () {
    var time = new Date().getTime();
    var obj1 = {
      createTime: time,
      updateTime: time,
    };
    // console.log("obj1", obj1);
    var obj2 = fromTimestamp(["createTime", "updateTime"])(obj1);
    // console.log("obj2", obj2);
    assert.strictEqual(
      new Date(obj1.createTime).toUTCString(),
      obj2.createTime
    );
    assert.strictEqual(
      new Date(obj1.updateTime).toUTCString(),
      obj2.updateTime
    );
  });
  it("should return serialized output", function () {
    var time = new Date().getTime();
    const ID = Symbol("id");
    const CREATETIME = Symbol("createTime");
    const keyMap = {
      id: ID,
      createTime: CREATETIME,
    };
    var obj1 = {
      [ID]: "123",
      [CREATETIME]: time,
    };
    var serialize = withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime"])
    );
    var obj2 = serialize(obj1);
    var obj3 = {
      createTime: new Date(time).toUTCString(),
      id: "123",
    };
    // console.log(fromTimestamps(["createTime"]).toString());
    // console.log(fromSymbols(keyMap).toString());
    // console.log(withSerializer(
    //   fromSymbols(keyMap),
    //   fromTimestamps(["createTime"])
    // ).toString());
    //console.log(makeModel.toString());
    // console.log("obj1", obj1);
    // console.log("obj2", obj2);
    // console.log("obj3", obj3);
    // console.log("stringify(obj1)", JSON.stringify(obj1));
    // console.log("stringify(obj2)", JSON.stringify(obj2));
    // console.log("stringify(obj3)", JSON.stringify(obj3));
    assert.strictEqual(JSON.stringify(obj2), JSON.stringify(obj3));
  });

  it("should return deserialized output", function () {
    var time = new Date().getTime();
    const ID = Symbol("id");
    const CREATETIME = Symbol("createTime");
    const keyMap = {
      id: ID,
      createTime: CREATETIME,
    };
    var obj1 = {
      [ID]: "123",
      [CREATETIME]: time,
    };
    var serialize = withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime"])
    );
    var deserialize = withDeserializers(
      toSymbol(keyMap),
    );
    var obj2 = deserialize(serialize(obj1));
    var obj3 = {
      createTime: new Date(time).toUTCString(),
      id: "123",
    };
    // console.log(fromTimestamps(["createTime"]).toString());
    // console.log(fromSymbols(keyMap).toString());
    // console.log(withSerializer(
    //   fromSymbols(keyMap),
    //   fromTimestamps(["createTime"])
    // ).toString());
    //console.log(makeModel.toString());
    console.log("obj1", obj1);
    console.log("obj2", obj2);
    console.log("obj3", obj3);
    console.log("parse(obj1)", JSON.parse(JSON.stringify(obj1)));
    console.log("parse(obj2)", JSON.parse(JSON.stringify(obj2)));
    console.log("parse(obj3)", JSON.parse(JSON.stringify(obj3)));
    assert.strictEqual(JSON.parse(JSON.stringify(obj2)), JSON.parse(JSON.stringify(obj)));
  });
});
