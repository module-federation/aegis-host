const order = require('./remote-entries-order')
const cache = require('./remote-entries-cache-aws')
const wasm2 = require('./remote-entries-wasm2.js')

module.exports = [order, cache, wasm2].flat()
