"use strict";

/**
 * State of the breaker.
 */
const State = {
  /** Breaker tripped. Error threshold breached. Client call suppressed. */
  Open: Symbol(),
  /** Closed circuit. Normal operation. Client call allowed. */
  Closed: Symbol(),
  /** Testing circuit. */
  HalfOpen: Symbol(),
};

/**
 * Circuit history
 */
const logs = new Map();

/**
 * Decorate client library functions with a circut breaker. When the breaker trips,
 * the breaker opens and prevents the client function from being executed. After a
 * wait period, the break switches to halfOpen. If the next transaction fails
 * @param {string} id function name or other unique name
 * @param {function()} protectedCall decorated client function
 * @param {{
 *  [x:string]: {
 *    errorRate:number
 *    callVolume:number,
 *    intervalMs:number,
 *    fallbackFn:function()
 *  },
 * }} options thresholds for different errors
 * @returns
 */
const CircuitBreaker = function (id, protectedCall, options) {
  function fetchLog() {
    if (logs.has(id)) {
      return logs.get(id);
    }
    return logs.set(id, []).get(id);
  }

  function findThreshold(error) {
    return options.default;
  }

  function onInterval(call) {
    call.time > Date.now() - threshold.intervalMs;
  }

  function thresholdBreached(error) {
    const threshold = findThreshold(error);
    const log = fetchLog().filter(onInterval);
    const errors = log.filter(e => e.error);
    const callVolume = log.length - errors.length;
    const errorRate = (errors.length / callVolume) * 100;
    return callVolume > threshold.callVolume && errorRate > threshold.errorRate;
  }

  /**
   * Get last known status of breaker
   * @returns {symbold} breaker state
   */
  function getState() {
    const log = fetchLog();
    if (log.length > 0) {
      return log[log.length - 1].state;
    }
    return State.Closed;
  }

  function appendLog(state, error = null, testDelay = 30000) {
    const log = fetchLog();
    log.push({ name: id, time: Date.now(), state, error, testDelay });
  }

  function testTime() {
    const log = fetchLog();
    const lastEntry = log[log.length - 1];
    return Date.now() - lastEntry.time > lastEntry.testDelay;
  }

  /**
   * The breaker switch.
   */
  const Switch = function () {
    /** current state of the braker */
    return {
      state: getState(),
      /**
       * Breaker closed. Normal function. Requests allowed.
       * @returns {boolean}
       */
      closed() {
        return this.state === State.Closed;
      },
      /**
       * Breaker open. Error threshold breached. Requests suppressed.
       * @returns {boolean}
       */
      open() {
        return this.state === State.Open;
      },
      /**
       *
       * @returns {boolean}
       */
      halfOpen() {
        return this.state === State.HalfOpen;
      },
      trip() {
        this.state = State.Open;
      },
      close() {
        this.state = State.Closed;
      },
      test() {
        this.state = State.HalfOpen;
      },
    };
  };

  return {
    // wrap client call
    async invoke(...args) {
      const breaker = Switch();

      appendLog(breaker.state);

      // check breaker status
      if (breaker.closed()) {
        try {
          return await protectedCall.apply(this, args);
        } catch (error) {
          if (thresholdBreached(error)) {
            breaker.trip();
          }
          appendLog(breaker.state, error);
          return this;
        }
      }

      if (breaker.open()) {
        if (testTime()) {
          breaker.test();
        } else {
          console.warn("circuit open, call aborted", protectedCall.name);
          return this;
        }
      }

      if (breaker.halfOpen()) {
        try {
          return await protectedCall.apply(this, args);
        } catch (error) {
          breaker.trip();
          appendLog(breaker.state, error);
        }
      }
    },
  };
};
export default CircuitBreaker;
