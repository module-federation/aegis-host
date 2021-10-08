const customer = require('./remote-entries-customer')
const cache = require('./remote-entries-cache')

module.exports = [customer, cache].flat()
