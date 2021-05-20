"use strict";

/**
 * State of the breaker.
 */
const State = {
  /** Breaker tripped. Error threshold breached. Client call suppressed. */
  Open: Symbol(),
  /** Closed circuit. Normal operation. Client call allowed. */
  Closed: Symbol(),
  /** Test circuit. Let next transation through. Close if it fails. */
  HalfOpen: Symbol(),
};

const DefaultThreshold = {
  /** Percentage of requests that failed within `intervalMs`. */
  errorRate: 20,
  /** Total number of requests within `intervalMs` */
  callVolume: 10,
  /** Milliseconds in which to measure threshold*/
  intervalMs: 10000,
  /** Milliseconds to wait after tripping breaker before retesting */
  retryDelay: 30000,
};

/**
 * Circuit history
 * @todo handle all state same way
 */
const logs = new Map();

/**
 *
 * @param {*} id
 * @returns
 */
function fetchLog(id) {
  if (logs.has(id)) {
    return logs.get(id);
  }
  return logs.set(id, []).get(id);
}

/**
 * Get last known status of breaker
 * @returns {symbold} breaker state
 */
function getState(log) {
  if (log.length > 0) {
    return log[log.length - 1].state;
  }
  return State.Closed;
}

function getThreshold(error, thresholds) {
  return thresholds[error.name] || thresholds.default || DefaultThreshold;
}

/**
 *
 * @param {*} id
 * @param {*} error
 * @param {*} thresholds
 * @returns
 */
function thresholdBreached(log, error, thresholds) {
  if (log.length < 1) return false;
  const threshold = getThreshold(error, thresholds);
  const entriesInScope = log.filter(
    entry => entry.time > Date.now() - threshold.intervalMs
  );
  const errors = entriesInScope.filter(e => e.error);
  const callVolume = entriesInScope.length - errors.length;
  const errorRate = (errors.length / callVolume) * 100;
  return callVolume > threshold.callVolume && errorRate > threshold.errorRate;
}

function setStateOnError(log, error, options) {
  const state = getState(log);
  if (
    state === State.HalfOpen ||
    (state === State.Closed && thresholdBreached(log, error, options))
  ) {
    return State.Open;
  }
  return state;
}

/**
 * log error and run thru breaker logic.
 * @param {string} id name of protected function
 * @param {string} error
 */
export function logError(id, error, thresholds) {
  const log = fetchLog(id);
  const state = setStateOnError(log, error, thresholds);
  const testDelay = getThreshold(error, thresholds).retryDelay;
  log.push({ name: id, time: Date.now(), state, error, testDelay });
}

/**
 *
 * @param {*} id
 * @returns
 */
function readyToTest(log) {
  if (log.length < 1) return true;
  const lastEntry = log[log.length - 1];
  return Date.now() - lastEntry.time > lastEntry.testDelay;
}

/**
 * The breaker switch.
 */
const Switch = function (id, thresholds) {
  const log = fetchLog(id);

  return {
    /** current state of the braker */
    state: getState(log),
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
     * Ready to test breaker.
     * @returns {boolean}
     */
    halfOpen() {
      return this.state === State.HalfOpen;
    },
    /**
     * Trip the breaker. Open switch.
     */
    trip() {
      this.state = State.Open;
    },
    /**
     * Reset the breaker. Close switch.
     */
    reset() {
      this.state = State.Closed;
    },
    /**
     * Test the breaker. Open switch half way. Let next transation thru.
     * If it fails, close it immediately without checking threshold.
     */
    test() {
      this.state = State.HalfOpen;
    },
    /**
     * Check error-specific threshold.
     * If none found, use default threshold
     * @param {Error} error
     * @returns {boolean}
     */
    thresholdBreached(error) {
      return thresholdBreached(log, error, thresholds);
    },
    /**
     * Check if its time to test the circuit, i.e. retry.
     * @returns {boolean}
     */
    readyToTest() {
      return readyToTest(log);
    },
    /**
     * Update log with current state and error details if error.
     * @param {*} error
     */
    appendLog(error = null) {
      log.push({
        name: id,
        time: Date.now(),
        state: this.state,
        testDelay: getThreshold(error, thresholds).retryDelay,
        error,
      });
    },
  };
};

/**
 * @typedef breaker
 * @property {function(...any)} invoke call protected function with args
 * @property {function(string)} errorListener update circuit breaker on error
 */

/**
 * Decorate client library functions with a circuit breaker. When the
 * function throws an exception, we check a threshold based on the error,
 * volume of requests and the rate of failure over a given interval. If a
 * threshold is breached, the breaker trips (opens) and prevents the client
 * function from being executed. It remains open until a test interval has
 * elapsed, at which point it is switched to half-open. If the next
 * transaction succeeds, it resets (closes) ands transactions can proceed
 * as normal. If it fails, the breaker trips again.
 *
 * @param {string} id function name or other unique name
 * @param {function()} protectedCall client function to protect
 * @param {{
 *  [x:string]: {
 *    errorRate:number
 *    callVolume:number,
 *    intervalMs:number,
 *    fallbackFn:function()
 *  },
 * }} thresholds thresholds for different errors
 * @returns {breaker}
 */
const CircuitBreaker = function (id, protectedCall, thresholds) {
  return {
    // wrap client call
    async invoke(...args) {
      const breaker = Switch(id, thresholds);
      breaker.appendLog();

      // check breaker status
      if (breaker.closed()) {
        try {
          return await protectedCall.apply(this, args);
        } catch (error) {
          if (breaker.thresholdBreached(error)) {
            breaker.trip();
          }
          breaker.appendLog(error);
          return this;
        }
      }

      if (breaker.open()) {
        if (breaker.readyToTest()) {
          breaker.test();
        } else {
          console.warn("circuit open, call aborted", protectedCall.name);
          return this;
        }
      }

      if (breaker.halfOpen()) {
        try {
          const result = await protectedCall.apply(this, args);
          breaker.reset();
          return result;
        } catch (error) {
          breaker.trip();
          breaker.appendLog(error);
        }
      }
    },

    /**
     * Listen for async / unthrown errors
     * @param {*} event
     */
    errorListener(event) {
      if (this.addListener) {
        this.addListener(event, ({ eventName }) =>
          logError(id, eventName, thresholds)
        );
      }
      console.error("not supported");
    },
  };
};

export default CircuitBreaker;
