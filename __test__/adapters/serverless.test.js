const assert = require('assert')
const { handleServerless } = require('../../src/server-less')

describe('adapters', function () {
  describe('serverless', function () {
    it('should return a response', async function () {
      const resp = await handleServerless({
        httpMethod: 'get',
        path: '/aegis/api/config',
        query: { isCached: false },
        headers: { 'idempotency-key': '123' }
      })
      if (resp) {
        assert.ok(resp)
        console.log(resp)
      } else {
        assert.fail('no resp')
      }
    })
  })
})
