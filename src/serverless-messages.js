const res = {
  send(data) {
    console.log("send", data);
    return data;
  },
  status(num) {
    console.log("status", num);
    return this;
  },
  set(data) {
    console.log("set", data);
  },
  headers: {},
  type: data => console.log(data),
};

let reqContent = {
  get: header => {
    const headers = {
      "Content-Type": "application/json",
      referer: "localhost",
      "User-Agent": "expressless",
    };
    return headers[header];
  },
};

// Thanks API GW for this 🙁
function handleMultiline(body) {
  if (!body) return null;
  return JSON.parse(
    body
      .split("\n")
      .map(s => s.trim())
      .join("")
  );
}
function getPropVal(key, obj, defaultValue = null) {
  return obj && obj[key] ? obj[key] : defaultValue;
}

const defaultPath = "/microlib/api/models/orders";

export const parsers = {
  aws: {
    request: args => ({
      req: {
        ...reqContent,
        path:
          getPropVal("path", args, "{any1+}").replace("{any+}", "orders") ===
          defaultPath
            ? defaultPath
            : getPropVal("path", args),
        method: getPropVal("httpMethod", args, "post").toLowerCase(),
        body: handleMultiline(getPropVal("body", args)),
        query: getPropVal("queryStringParameters", args),
        apiGatewayRequest: { ...args },
      },
      res,
    }),
    response: args => ({
      isBase64Encoded: false,
      statusCode: getPropVal("statusCode", args, 200),
      headers: getPropVal("headers", args, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(getPropVal("body", args, {})),
    }),
  },

  /**@todo not implemented */
  azure: args => ({ req: { ...args, ...reqContent }, res }),

  /**@todo not implemented */
  google: args => ({ req: { ...args, ...reqContent }, res }),

  /**@todo not implemented */
  ibm: args => ({ req: { ...args, ...reqContent }, res }),
};
