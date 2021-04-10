"use strict";

const THRESHOLD = 5;
let errorCount = 0;
let lastError;

const State = {
  Open: Symbol(),
  Closed: Symbol(),
  HalfOpen: Symbol(),
};

const Breaker = {
  state: State.Closed,
  closed() {
    return this.state === State.Closed;
  },
  open() {
    return this.state === State.Open;
  },
  halfOpen() {
    return this.state === State.HalfOpen;
  },
  trip() {
    this.state = State.Closed;
    tripped = Date.now();
  },
  test(protectedCall, args) {
    this.state = State.HalfOpen;
    try {
      return protectedCall(...args);
    } catch (error) {
      errorCount++;
    }
  },
  reset() {
    errorCount = 0;
    this.state = State.Open;
  },
};

function thresholdBreached() {
  const secondsSinceLastError = new Date(Date.now() - lastError).getSeconds();
  return errorCount > THRESHOLD && secondsSinceLastError < 30;
}

const Circuit = function (protectedCall) {
  return {
    invoke(...args) {
      if (Breaker.closed()) {
        try {
          return protectedCall(...args);
        } catch (error) {
          errorCount++;
          lastError = Date.now();
          console.error(error, errorCount);
          return;
        }
      }

      if (thresholdBreached()) {
        Breaker.trip();
      } else {
        if (Breaker.test(protectedCall, args)) {
          Breaker.reset();
        } else {
          lastError = Date.now();
        }
      }
    },
  };
};
