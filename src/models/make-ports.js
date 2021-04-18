"use strict";

import portHandler from "./port-handler";
import async from "../lib/async-error";
import domainEvents from "./domain-events";
import CircuitBreaker, { logError } from "./circuit-breaker";

const TIMEOUTSECONDS = 60;
const MAXRETRY = 5;

function getTimerArgs(args) {
  const timerArg = { calledByTimer: new Date().toUTCString() };
  if (args) return [...args, timerArg];
  return [timerArg];
}

/**
 *
 * @param {*} args
 * @returns
 */
function getRetries(args) {
  const timerArgs = getTimerArgs(args);
  const retries = timerArgs.filter(arg => arg.calledByTimer);
  return {
    count: retries.length,
    nextArg: timerArgs,
  };
}

/**
 * Implement recursive retry if port times out.
 * @param {{
 *  portName: string,
 *  portConf: import('../models').ports,
 * }} options
 */
function setPortTimeout(options) {
  const { portConf, portName, model, args } = options;
  const handler = portConf.timeoutCallback;
  const noTimer = portConf.timeout === 0;
  const timeout = (portConf.timeout || TIMEOUTSECONDS) * 1000;
  const maxRetry = portConf.maxRetry || MAXRETRY;
  const timerArgs = getRetries(args);
  const expired = () => timerArgs.count > maxRetry;

  const noOp = {
    enabled: false,
    stopTimer: () => void 0,
    expired,
  };

  if (noTimer) {
    return noOp;
  }

  if (expired()) {
    model.emit(domainEvents.portRetryFailed(model), options);
    return {
      ...noOp,
      enabled: true
    }
  }

  // Retry the port on timeout
  const timerId = setTimeout(async () => {
    // Notify interested parties
    model.emit(domainEvents.portTimeout(model), options);

    // Invoke optional custom handler
    if (handler) handler(options);

    // Count retries by adding to an array passed on the stack
    await async(model[portName](...timerArgs.nextArg));

    // Retry worked
    model.emit(domainEvents.portRetryWorked(model), options);
  }, timeout);

  return {
    ...noOp,
    enabled: true,
    stopTimer: () => clearTimeout(timerId),
  };
}

/**
 * @param {function({model:Model,port:string},{*})} cb
 */
function getPortCallback(cb) {
  if (typeof cb === "function") {
    return cb;
  }
  return portHandler;
}

/**
 * Are we compensating for a failed or canceled transaction?
 * @param {import(".").Model} model
 * @returns {boolean}
 */
async function isUndoRunning(model) {
  const latest = await model.find(model.getId());
  return latest.compensate;
}

/**
 * Register an event handler that invokes this `port`.
 * @param {string} portName
 * @param {import('.').ports[portName]} portConf
 * @param {import("./observer").Observer} observer
 * @param {boolean} disabled
 * @returns {boolean} whether or not to remember this port
 * for compensation and restart
 */
function addPortListener(portName, portConf, observer, disabled) {
  if (disabled) return false;

  if (portConf.consumesEvent) {
    const callback = getPortCallback(portConf.callback);

    // listen for triggering event
    observer.on(
      portConf.consumesEvent,
      async function ({ eventName, model }) {
        // Don't call any more ports if we are reversing a transaction.
        if (await isUndoRunning(model)) {
          console.warn("undo running, canceling port operation");
          return;
        }
        console.info(`event ${eventName} fired: calling port ${portName}`);
        // invoke this port
        await async(model[portName](callback));
      },
      false
    );
    return true;
  }
  return false;
}

/**
 * Pop the stack and update the model, immutably.
 * @param {import(".").Model} model
 * @param {*} port
 * @param {*} remember
 * @returns {Promise<import(".").Model>}
 */
async function updatePortFlow(model, port, remember) {
  if (!remember) return model;

  return model.update(
    {
      [model.getKey("portFlow")]: [...model.getPortFlow(), port],
    },
    false
  );
}

/**
 * Generate functions to handle I/O between the domain
 * and application layers. Each port is assigned an adapter,
 * which either invokes the port (inbound) or is invoked by
 * it (outbound). Ports can be instrumented for exceptions
 * and timeouts. They can also be piped together in a control
 * flow by specifying the output event of one port as the input
 * or triggering event of another.
 *
 * See the `ModelSpecification` for port configuration options.
 *
 * @param {import('./index').ports} ports - object containing domain interfaces
 * @param {object} adapters - object containing application adapters
 * @param {import('./observer').Observer} observer
 */
export default function makePorts(ports, adapters, observer) {
  if (!ports || !adapters) {
    return;
  }

  return Object.keys(ports)
    .map(function (port) {
      const portName = port;
      const portConf = ports[port];
      const disabled = portConf.disabled || !adapters[port];

      // Listen for event that will invoke this port
      const rememberPort = addPortListener(
        portName,
        portConf,
        observer,
        disabled
      );

      /**
       *
       * @param  {...any} args
       * @returns
       */
      async function portFn(...args) {
        // Don't run if port is disabled
        if (disabled) {
          return this;
        }

        // Handle port timeouts
        const timer = setPortTimeout({
          portName,
          portConf,
          model: this,
          args,
        });

        if (timer.enabled && timer.expired()) {
          // This means we hit max retries, update circuit breaker
          logError(
            portName,
            domainEvents.portRetryFailed(this),
            portConf.circuitBreaker
          );
          return this;
        }

        try {
          // Call the adapter and wait
          const model = await adapters[port]({ model: this, port, args });

          // Stop the timer
          timer.stopTimer();

          // Remember what ports we called for undo and restart
          const saved = await updatePortFlow(model, port, rememberPort);

          // Signal the next port to run.
          if (rememberPort) {
            await saved.emit(portConf.producesEvent, portName);
          }

          return saved;
        } catch (error) {
          console.error({ file: __filename, func: port, args, error });

          // Is the timer still running?
          if (timer.expired()) {
            // Try to back out previous transactions.
            await async(this.undo());
            return this;
          }

          throw new Error("error calling port", error, port);
        }
      }

      return {
        // The port function
        async [port](...args) {
          const config = portConf.circuitBreaker;
          // check if the port requires a breaker
          if (config) {
            // wrap port call in circuit breaker
            const breaker = CircuitBreaker(port, portFn, config);
            // invoke port with circuit breaker failsafe
            return breaker.invoke.apply(this, args);
          }
          // no breaker
          return portFn.apply(this, args);
        },
      };
    })
    .reduce((p, c) => ({ ...p, ...c }));
}
