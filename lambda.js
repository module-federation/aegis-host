// const serverless = require("serverless-http");
// let callback;

// require("./dist/index").startService(function (app) {
//   callback = serverless(app);
// });

// module.exports.handler = async (event, context) => {
//   return await callback(event, context);
// };
const microlib = require("./dist");
const context = {};
const callback = () => "don't care";

const order = {
  firstName: "Uncle",
  lastName: "Bob",
  email: "bob@email.com",
  creditCardNumber: "378282246310005",
  shippingAddress: "123 Park Ave. NY, NY 45678",
  billingAddress: "123 Park Ave. NY, NY 45678",
  orderItems: [
    { itemId: "item1", price: 329.95 },
    { itemId: "item2", price: 59.0, qty: 4 },
  ],
};

const post = {
  query: null,
  path: "/microlib/api/models/orders",
  method: "post",
  get: header => {
    const headers = {
      "Content-Type": "application/json",
      referer: "localhost",
      "User-Agent": "expressless",
    };
    return headers[header];
  },
  body: order,
  query: "count=all",
  params: null,
  provider: "aws",
};

const getById = {
  query: null,
  path: "/microlib/api/models/orders/:id",
  method: "get",
  get: header => {
    const headers = {
      "Content-Type": "application/json",
      referer: "localhost",
      "User-Agent": "expressless",
    };
    return headers[header];
  },
  body: order,
  query: "count=all",
  params: null,
  provider: "aws",
};

microlib.handleServerlessRequest(post, {}, x => x);

const sleep = async ms => await new Promise(res => setTimeout(res, 3000));

sleep(3000);

microlib.handleServerlessRequest(getById, {}, x => x);
