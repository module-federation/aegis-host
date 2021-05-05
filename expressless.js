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

const payloads = {
  post: {
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
    query: null,
    params: { id: "116ce522-a7dc-4578-aef3-bb9ce276df08" },
    provider: "aws",
  },

  getbyid: {
    query: null,
    path: "/microlib/api/models/orders",
    method: "get",
    params: { id: "116ce522-a7dc-4578-aef3-bb9ce276df08" },
    get: header => {
      const headers = {
        "Content-Type": "application/json",
        referer: "localhost",
        "User-Agent": "expressless",
      };
      return headers[header];
    },
    query: null,
    params: { id: "116ce522-a7dc-4578-aef3-bb9ce276df08" },
    provider: "aws",
  },

  get: {
    query: null,
    path: "/microlib/api/models/orders",
    method: "get",
    params: null,
    get: header => {
      const headers = {
        "Content-Type": "application/json",
        referer: "localhost",
        "User-Agent": "expressless",
      };
      return headers[header];
    },
    query: null,
    params: null,
    provider: "aws",
  },
};

process.stdin.pipe(require("split")()).on("data", processLine);
console.log("press return to execute");

async function processLine(line) {
  const methodModelId = line.split(" ");

  if (["post", "getbyid", "get"].includes(methodModelId[0].toLowerCase())) {
    if (methodModelId.length > 1) {
      payloads["getbyid"].url += "/" + methodModelId[1];
    }
    const result = await microlib.handleServerlessRequest(
      payloads[methodModelId[0].toLowerCase()]
    );
    console.log(result);
  } else {
    console.log(await microlib.handleServerlessRequest(payloads["post"]));
  }
}
