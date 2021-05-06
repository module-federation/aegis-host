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

function getThreshold(error, options) {
  return options[error.name] || options.default || DefaultThreshold;
}

/**
 *
 * @param {*} id
 * @param {*} error
 * @param {*} options
 * @returns
 */
function thresholdBreached(log, error, options) {
  if (log.length < 1) return false;
  const threshold = getThreshold(error, options);
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
    return State.Open();
  }
  return state;
}

/**
 * log error and run thru breaker logic.
 * @param {string} id name of protected function
 * @param {string} error
 */
export function logError(id, error, options) {
  const log = fetchLog(id);
  let state = setStateOnError(log, error, options);
  const testDelay = getThreshold(error, options).retryDelay;
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
const Switch = function (id, options) {
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
      return thresholdBreached(log, error, options);
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
        testDelay: getThreshold(error, options).retryDelay,
        error,
      });
    },
  };
};

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
 * @class
 */
const CircuitBreaker = function (id, protectedCall, options) {
  return {
    // wrap client call
    async invoke(...args) {
      const breaker = Switch(id, options);
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
  };
};

export default CircuitBreaker;
