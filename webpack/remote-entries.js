const cache = require("./remote-entries-cache");
const github = require("./remote-entries-github");

module.exports = github.concat(cache);
