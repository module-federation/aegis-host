const order = require('./remote-entries-order')
const wasm = require('./remote-entries-wasm')
const cache = require('./remote-entries-cache')

module.exports = [order, wasm, cache].flat()
