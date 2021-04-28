const microlib = require("./index");
const serverless = require("serverless-http");
let app = null;
let callback = async () => console.log("not started");


module.exports.handler = async (event, context) => {
  if (!app) {
    app = await microlib.start();
    callback = serverless(app);
  }
  return await callback(event, context);
};
