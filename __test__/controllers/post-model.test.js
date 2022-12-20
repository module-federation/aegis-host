'use strict'

const {
  AppError,
  ThreadPoolFactory,
  EventBrokerFactory,
  DataSourceFactory,
  DomainEvents,
  default: ModelFactory
} = require('@module-federation/aegis/lib/domain')

var assert = require('assert')

const makeCreateModel = require('@module-federation/aegis/lib/domain/use-cases/create-model')
  .default
const postModelFactory = require('@module-federation/aegis/lib/adapters/controllers/post-model')
  .default

describe('Controllers', function () {
  describe('postModel()', function () {
    it('should add new model', async function () {
      ModelFactory.registerModel({
        modelName: 'ABC',
        factory: ({ a }) => ({ a, b: 'c' }),
        endpoint: 'abcs',
        dependencies: {}
      })
      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        'ABC',
        model => ({ model })
      )
      const createModel = makeCreateModel({
        modelName: 'ABC',
        models: ModelFactory,
        repository: DataSourceFactory.getDataSource('ABC'),
        //broker: EventBrokerFactory.getInstance(),
        domainEvents: DomainEvents,
        AppError: AppError,
        threadpool: ThreadPoolFactory.getThreadPool('ABC')
      })
      const resp = await postModelFactory(createModel)({
        body: { a: 'a' },
        headers: { 'User-Agent': 'test' },
        ip: '127.0.0.1',
        log: () => 1
      })
      console.log('resp.status', resp.statusCode)
      assert.strictEqual(resp.statusCode, 201)
    })
  })
})
