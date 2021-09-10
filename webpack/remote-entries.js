const order = require("./remote-entries-order");
const cache = require("./remote-entries-cache-aws");

module.exports = [order, cache].flat();