"use strict";
//const pkg = require("./package.json");
import service from "whois";
const domain = "module-federation.org";

export async function whois(domain) {
  return lookup(domain);
}

async function lookup(domain) {
  return new Promise(async function (resolve) {
    service.lookup(domain, function (_err, data) {
      resolve({
        data,
        getEmail() {
          data.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)[0];
        },
      });
    });
  });
}

//whois(domain).then(email => console.log(email));
