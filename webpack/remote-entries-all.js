const order = require('./remote-entries-order')
const customer = require('./remote-entries-customer')

module.exports = [order, customer].flat()
