'use strict'

var assert = require('assert');

import Model from '../../src/models/model'

describe('Model', function () {
  describe('#create()', function () {
    it('should return new model', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ c: 'c' }]
      });
      assert.ok(model)
    });
  });
  describe('#getId()', function () {
    it('should return model ID', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: (...b) => ({ a: 'a', b }),
        },
        args: [{ c: 'c' }]
      });
      assert.ok(Model.getId(model));
    });
  });
  describe('#getName()', function () {
    it('should return model name', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      assert.strictEqual(Model.getName(model), 'ABC');
    });
  });
  describe('#a', function () {
    it('should return model prop', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      assert.strictEqual(model.a, { a: 'a', b: 'c' }.a);
    });
  });
  describe('#b', function () {
    it('should return model prop', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      assert.strictEqual(model.b, { a: 'a', b: 'c' }.b);
    });
  });
  describe('#getKey()', function () {
    it('should return key', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      assert.ok(Model.getKey('onUpdate'));
    });
  });
  describe('#onUpdate()', function () {
    it('should return updated model', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      const updated = model[Model.getKey('onUpdate')]({ a: 'b' });
      assert.strictEqual(updated.a, { a: 'b' }.a);
    });
  });
});