const microlib = require("./index");
const serverless = require("serverless-http");
let callback = () => console.log("uninitialized");

microlib.start().then(function (app) {
  callback = serverless(app);
});

module.exports.handler = async (event, context) => {
  return await callback(event, context);
};
