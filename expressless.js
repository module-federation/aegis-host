/**
 * Serverless test harness.
 */

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

const awsEvent = {
  resource: "Resource path",
  path: "http://microlib/api/models/orders",
  httpMethod: "get",
  headers: "String containing incoming request headers",
  multiValueHeaders: "ist of strings containing incoming request headers",
  queryStringParameters: "query string parameters",
  multiValueQueryStringParameters: "List of query string parameters",
  pathParameters: "",
  stageVariables: "",
  requestContext:
    "Request context, including authorizer-returned key-value pairs",
  body: 
  isBase64Encoded: false
};

const payloads = {
  post: {
    event: awsEvent,
    context: {},
    callback: x => x,
  },

  getbyid: {
    query: null,
    path: "/microlib/api/models/orders",
    method: "get",
    pa,
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
console.log(
  "type post,get,getbyid,patch,delete with modelId if needed and press return to execute"
);

async function processLine(line) {
  const [method, modelId] = line.split(" ");

  if (["post", "getbyid", "get"].includes(method.toLowerCase())) {
    if (modelId) {
      payloads["getbyid"].url += "/" + modelId;
    }
    const result = await microlib.handleServerlessRequest(
      payloads[method.toLowerCase()]
    );
    console.log(result);
  } else {
    console.log(await microlib.handleServerlessRequest(payloads["post"]));
  }
}
