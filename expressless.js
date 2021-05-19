/**
 * Serverless test harness.
 */

const microlib = require("./dist");

function awsEvent(method, path) {
  return {
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
  "type post,get,getbyid,patch,delete (:id) and press return to execute"
);

async function processLine(line) {
  let [method, modelId, command] = line.split(" ");
  method = method.toLowerCase();

  if (Object.keys(payloads).includes(method)) {
    if (modelId) {
      payloads[method].event.path += String(modelId);
      payloads[method].event.pathParameters = { id: modelId };
    }
    if (command) {
      payloads[method].event.path += "/" + command;
      payloads[method].event.pathParameters = {
        ...payloads[method].event.pathParameters,
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
