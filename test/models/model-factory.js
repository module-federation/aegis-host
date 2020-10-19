'use strict'

var assert = require('assert');

import ModelFactory from '../../src/models'

describe('ModelFactory', function () {
  describe('#registerModel()', function () {
    it('should register model', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({ a }) => ({ a, b: 'c' }),
        endpoint: 'abcs',
        dependencies: {}
      });
      const model = await ModelFactory.createModel('ABC', [{ a: 'a' }]);
      assert.strictEqual(ModelFactory.getModelName(model), 'ABC');
    });
  });
});