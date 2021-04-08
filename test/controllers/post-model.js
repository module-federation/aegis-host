'use strict'

var assert = require('assert');

import addModelFactory from '@module-federation/aegis/esm/use-cases/add-model'
import postModelFactory from '@module-federation/aegis/esm/controllers/post-model'

import DataSourceFactory from '@module-federation/aegis/lib/datasources'
import ModelFactory from '@module-federation/aegis/lib/models';
import ObserverFactory from '@module-federation/aegis/lib/models/observer';
import hash from '@module-federation/aegis/esm/lib/hash'

describe('Controllers', function () {
  describe('postModel()', function () {
    it('should add new model', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({ a }) => ({ a, b: 'c' }),
        endpoint: 'abcs',
        dependencies: {}
      });
      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        'ABC',
        (model) => ({ model })
      );
      const addModel = await addModelFactory({
        modelName: 'ABC',
        models: ModelFactory,
        repository: DataSourceFactory.getDataSource('ABC'),
        observer: ObserverFactory.getInstance()
      });
      const resp = await postModelFactory(
        addModel,
        ModelFactory.getModelId,
        hash
      )({ body: { a: 'a' }, headers: { 'User-Agent': 'test' }, ip: '127.0.0.1' });
      assert.strictEqual(resp.statusCode, 201);
    });
  });
});