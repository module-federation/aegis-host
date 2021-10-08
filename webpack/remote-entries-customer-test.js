//const order = require('./remote-entries-order')
const wasm = require('./remote-entries-wasm')
const cache = require('./remote-entries-cache')
const customer = require('./remote-entries-customer')

module.exports = [customer, wasm, cache].flat()
