'use strict'

var assert = require('assert');

import ModelFactory from '@module-federation/aegis/lib/models';


describe('ModelFactory', function () {
  describe('#createModel()', function () {
    it('should register & create model', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({ a }) => ({ a, b: 'c' }),
        endpoint: 'abcs',
        dependencies: {}
      });
      const model = await ModelFactory.createModel('ABC', { a: 'a' });
      assert.strictEqual(ModelFactory.getModelName(model), 'ABC');
    });
    it('should have props from args', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({ a }) => ({ a, b: 'c' }),
        endpoint: 'abcs',
        dependencies: {}
      });
      const model = await ModelFactory.createModel('ABC', { a: 'a' });
      assert.strictEqual(model.a, 'a');
    });
  });
});