"use strict";

const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const authEnabled = process.env.AUTH_ENABLED === "true" || false;

module.exports = function (app, path) {
  if (!authEnabled) return app;

  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://dev-2fe2iar6.us.auth0.com/.well-known/jwks.json",
    }),
    audience: "https://microlib.io/",
    issuer: "https://dev-2fe2iar6.us.auth0.com/",
    algorithms: ["RS256"],
  });

  app.use(path, jwtCheck);

  return app;
};
