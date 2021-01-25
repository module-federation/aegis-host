"use strict";

import Model from "./model";
import portHandler from "./port-handler";
import async from "../lib/async-error";
import domainEvents from "./domain-events";

const TIMEOUT_SECONDS = 60;
const MAX_RETRY = 5;

function getTimerArgs(args) {
  const timerArg = { calledByTimer: new Date().toUTCString() };
  if (args) return [...args, timerArg];
  return [timerArg];
}

/**
 * We keep track of retries by passing a new argument each time
 * @param {*} args
 */
function getRetries(args) {
  const timerArgs = getTimerArgs(args);
  const retries = timerArgs.filter((arg) => arg.calledByTimer);
  return {
    count: retries.length,
    nextArg: timerArgs,
  };
}

/**
 * Implements retry with recursive timeout.
 * @param {{
 *  portName: string,
 *  portConf: import('../models').ports,
 * }} options
 */
function setPortTimeout(options) {
  const { portConf, portName, model, args } = options;
  const handler = portConf.timeoutCallback;
  const noTimer = portConf.timeout === 0 ? true : false;
  const timeout = (portConf.timeout || TIMEOUT_SECONDS) * 1000;
  const maxRetry = portConf.maxRetry || MAX_RETRY;
  const timerArgs = getRetries(args);

  const noOp = {
    stopTimer: () => void 0,
    done: () => true,
  };

  if (noTimer) {
    return noOp;
  }

  if (timerArgs.count > maxRetry) {
    console.warn("max retries reached", timerArgs);
    return noOp;
  }

  // Retry the port
  const timerId = setTimeout(async () => {
    // Notify interested parties
    model.emit(domainEvents.portTimeout(model), options);

    // Invoke custom handler
    if (handler) handler(options);

    // Keep track of retries by adding a new arg each time
    await model[portName](...timerArgs.nextArg);

    // Retry worked
    model.emit(domainEvents.portRetryWorked(model), options);
  }, timeout);

  return {
    stopTimer: () => clearTimeout(timerId),
    done: () => timerArgs.count > maxRetry,
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
 * Register an event handler that invokes the `port`.
 * @param {import('./index').Model} model
 * @returns {boolean} whether or not to remember this port
 * for compensation and restart
 */
function addPortListener(portName, portConf, observer, disabled) {
  if (disabled) return false;

  if (portConf.consumesEvent) {
    const callback = getPortCallback(portConf.callback);

    // listen for the triggering event to invoke this port
    observer.on(
      portConf.consumesEvent,
      async function (model) {
        // Invoke this port and pass a callack
        const result = await async(model[portName](callback));
        if (!result.ok) {
          throw new Error(result.error);
        }
      },
      false
    );
    return true;
  }
  return false;
}

/**
 * The Immutable way to say model.portFlow.pop().
 * @param {Model} model
 * @param {*} port
 * @param {*} remember
 */
function updatePortFlow(model, port, remember) {
  if (!remember) return model;
  return model.update({
    [Model.getKey("portFlow")]: [...Model.getPortFlow(model), port],
  });
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
 * @param {import('../lib/observer').Observer} observer
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
      const recordPort = addPortListener(
        portName,
        portConf,
        observer,
        disabled
      );

      return {
        // The port function
        async [port](...args) {
          // Don't run if port is disabled
          if (disabled) {
            return;
          }

          // Handle port timeouts
          const timer = setPortTimeout({
            portName,
            portConf,
            model: this,
            args,
          });

          try {
            // Call the adapter and wait
            const model = await adapters[port]({ model: this, port, args });

            // Stop the timer
            timer.stopTimer();

            // Remember invocations for undo and restart
            const updated = updatePortFlow(model, port, recordPort);

            // Signal the next task to run, unless undo is running
            if (!updated.compensate && recordPort) {
              this.emit(portConf.producesEvent, updated);
            }
          } catch (error) {
            console.error(error);

            // Is the timer still running?
            if (timer.done()) {
              // Try to back out previous transactions.
              const result = await async(this.undo());

              if (result.ok) {
                console.log("undo: transactions rolled back.");
              }
            }
          }
        },
      };
    })
    .reduce((p, c) => ({ ...c, ...p }));
}
