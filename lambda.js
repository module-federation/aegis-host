const serverless = require("serverless-http");
let callback;

require("./dist/index").startService(function (app) {
  callback = serverless(app);
});

module.exports.handler = async (event, context) => {
  return await callback(event, context);
};
