'use strict'

var assert = require('assert');

import Model from '@module-federation/aegis/lib/models/model'


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
      assert.ok(model);
    });
  });
  describe('#injection()', function () {
    it('dependency injection should work', async function () {
      function make(dependencies) {
        return async (...b) => ({
          a: 'a',
          b,
          injection: dependencies.injection
        })
      }
      const dependencies = {
        injection() {
          return this;
        }
      }
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: make(dependencies),
          dependencies
        },
        args: [{ c: 'c' }]
      });
      assert.strictEqual(model, model.injection());
    });
  });
  describe('#port1()', function () {
    it('should generate port and attach to adapter', async function () {
      const adapters = {
         async port1({ model }) {
           console.log(model);
        }
      }

      function make() {
        return (...b) => ({ a: 'a', b });
      }

      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: make(),
          ports: {
            port1: {
              type: 'outbound'
            }
          },
          dependencies: {...adapters}
        },
        args: [{ c: 'c' }]
      });
      assert.ok(model.port1());
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
      assert.ok(Model.getId(model));
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
      assert.strictEqual(model.a, 'a');
    });
  });
  describe('#b', function () {
    it('should return model prop with args value', async function () {
      const model = await Model.create({
        spec: {
          modelName: 'ABC',
          factory: ({ b }) => ({ a: 'a', b }),
        },
        args: [{ b: 'c' }]
      });
      assert.strictEqual(model.b, 'c');
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
      assert.strictEqual(model.a, 'a');
      const updated = model[Model.getKey('onUpdate')]({ a: 'b' });
      assert.strictEqual(updated.a, 'b');
    });
  });
});