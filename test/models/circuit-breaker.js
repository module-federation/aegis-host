"use strict";

var assert = require("assert");

import CircuitBreaker from "../../src/models/circuit-breaker";
import Model from "../../src/models/circuit-breaker";

describe("Model", function () {
  const breaker = CircuitBreaker(
    "myfunc",
    x => {
      if (x === 1) {
        throw Error("error");
      }
    },
    {
      default: {
        errorRate: 100,
        callVolume: 2,
        intervalMs: 1000,
        testDelay: 2000,
      },
    }
  );

  for (const i = 0; i > 10; i++) breaker.invoke(1);
});
