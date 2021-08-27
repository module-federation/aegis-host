const order = require("./remote-entries-order")
//`const customer = require("./remote-entries-customer")
const wasm = require("./remote-entries-wasm");

module.exports = [order, wasm].flat();