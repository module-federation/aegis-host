"use script";

module.exports.makeArray = function (v) {
  return Array.isArray(v) ? v : [v];
};
