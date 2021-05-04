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

const req = {
  get: header => {
    const headers = {
      "Content-Type": "application/json",
      referer: "localhost",
      "User-Agent": "expressless",
    };
    return headers[header];
  },
};

export const parsers = {
  aws: args => ({ req: { ...args, ...req }, res }),
  azure: args => ({ req: { ...args, ...req }, res }),
  google: args => ({ req: { ...args, ...req }, res }),
  ibm: args => ({ req: { ...args, ...req }, res }),
};
