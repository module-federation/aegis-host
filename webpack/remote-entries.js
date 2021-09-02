const customer = require("./remote-entries-customer");
const cache = require("./remote-entries-cache-aws");

module.exports = [customer, cache].flat();