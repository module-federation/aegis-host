/**
 * Serverless test harness.
 */

const microlib = require("./dist");

function awsEvent(method, path) {
  return {
    path: path,
    httpMethod: method,
    headers: "String containing incoming request headers",
    multiValueHeaders: "ist of strings containing incoming request headers",
    queryStringParameters: "",
    multiValueQueryStringParameters: "List of query string parameters",
    pathParameters: "",
    stageVariables: "",
    requestContext:
      "Request context, including authorizer-returned key-value pairs",
    body: {
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
    },
    isBase64Encoded: false,
  };
}

const payloads = {
  post: {
    event: awsEvent("post", "/microlib/api/models/orders"),
    context: {},
    callback: x => x,
  },

  get: {
    event: awsEvent("get", "/microlib/api/models/orders"),
    context: {},
    callback: x => x,
  },

  getbyid: {
    event: awsEvent("get", "/microlib/api/models/orders/"),
    context: {},
    callback: x => x,
  },

  patch: {
    event: awsEvent("patch", "/microlib/api/models/orders/"),
    context: {},
    callback: x => x,
  },

  delete: {
    event: awsEvent("delete", "/microlib/api/models/orders/"),
    context: {},
    callback: x => x,
  },
};

process.stdin.pipe(require("split")()).on("data", processLine);
console.log(
  "type post,get,getbyid,patch,delete with :id if needed and press return to execute"
);

async function processLine(line) {
  let [method, modelId, command] = line.split(" ");

  method = method.toLowerCase();
  command = command.toLowerCase();

  if (Object.keys(payloads).includes(method)) {
    if (modelId) {
      payloads[method].event.path += String(modelId);
      payloads[method].event.pathParameters = { id: modelId };
    }
    if (command) {
      payloads[command].event.path += "/" + command;
      payloads[command].event.pathParameters = {
        ...payloads[command].event.pathParameters,
        command,
      };
    }
    const result = await microlib.handleServerlessRequest(payloads[method]);
    console.log(result);
  } else {
    const result = await microlib.handleServerlessRequest(payloads["post"]);
    console.log(result);
  }
}
