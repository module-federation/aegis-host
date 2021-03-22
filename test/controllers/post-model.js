'use strict'

var assert = require('assert');
const addModelFactory = require('../../src/use-cases/add-model')
const postModelFactory = require('../../src/controllers/post-model')
const DataSourceFactory = require('../../src/datasources')
const ModelFactory = require('../../src/models');
const ObserverFactory = require('../../src/lib/observer');
const hash = require('@module-federation/aegis/lib/lib/hash')

describe('Controllers', function () {
  describe('postModel()', function () {
    it('should add new model', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({a}) => ({a, b: 'c'}),
        endpoint: 'abcs',
        dependencies: {}
      });
      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        'ABC',
        (model) => ({model})
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
      )({body: {a: 'a'}, headers: {'User-Agent': 'test'}, ip: '127.0.0.1'});
      assert.strictEqual(resp.statusCode, 201);
    });
  });
});
