const microlib = require("./dist");

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

setTimeout(microlib.handleServerlessRequest, 20000, getById);

process.stdin.pipe(require("split")()).on("data", processLine);

console.log("press return to execute");

async function processLine(line) {
  post.msg = line;
  console.log(line + "!");
  await microlib.handleServerlessRequest(post);
}
