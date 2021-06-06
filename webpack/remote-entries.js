const githubEntries = require("./remote-entries-github");
// const cacheEntries = require("./remote-entries-cache");
const cacheEntries = [];

module.exports = githubEntries.concat(cacheEntries);
