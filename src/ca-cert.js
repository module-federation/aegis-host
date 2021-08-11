"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});

//const pkg = require("./package.json");
import whois from "./whois";

const domain = "example.com";

const Greenlock = require("greenlock");
const greenlock = Greenlock.create({
  // used for the ACME client User-Agent string as per RFC 8555 and RFC 7231
  packageAgent: "someinfo", //pkg.name + "/" + pkg.version,

  // used as the contact for critical bug and security notices
  // should be the same as pkg.author.email`
  maintainerEmail: (await whois(domain)).getEmail(), // (await whois(domain)).email,

  // used for logging background events and errors
  notify: function (ev, args) {
    if ("error" === ev || "warning" === ev) {
      console.error(ev, args);
      return;
    }
    console.info(ev, args);
  },
});

greenlock
  .get({ servername: domain })
  .then(function (result) {
    if (!result) {
      // certificate is not on the approved list
      return null;
    }

    const fullchain = result.pems.cert + "\n" + result.pems.chain + "\n";
    const privkey = result.pems.privkey;

    return {
      fullchain: fullchain,
      privkey: privkey,
    };
  })
  .catch(function (e) {
    // something went wrong in the renew process
    console.error(e);
  });
