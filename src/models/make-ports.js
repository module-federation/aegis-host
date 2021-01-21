"use strict";

import Model from "./model";
import portHandler from "./port-handler";
import async from "../lib/async-error";

const TIMEOUT_SECONDS = 60;
const MAX_RETRY = 3;
let retryCount = 0;

async function retryHandler(options) {
  const { portName, model, timeout, maxRetry, args } = options;

  args.push({ calledByTimer: true });
  retryCount++;
  let timerId;

  console.log("retry count", retryCount);

  if (retryCount < maxRetry) {
    timerId = setTimeout(retryHandler, timeout, options);
    console.log("calling port", portName, retryCount, maxRetry, args);
    await model[portName](...args);
    clearTimeout(timerId);
    return;
  }
  console.log("max retry attempts reached", portName);
}
/**
 * Set an appropriate timeout interval and handler for the port.
 * @param {{
 *  portName: string,
 *  portConf: import('../models').ports,
 * }} options
 */
function setPortTimeout(options, ...args) {
  // Set an appropriate timeout for the port
  const { portName, portConf } = options;
  const noTimer = portConf.timeout === 0 ? true : false;
  const timeout = (portConf.timeout || TIMEOUT_SECONDS) * 1000;

  // Call the port's timeout handler if configured
  const handler = portConf.timeoutCallback || retryHandler;
  const maxRetry = portConf.maxRetry || MAX_RETRY;

  let timerId = -1;
  const lastArg = args.pop();

  if (noTimer || (typeof lastArg === "object" && lastArg.calledByTimer)) {
    console.log(
      "either called by a timer or port has no timeout, skipping...",
      portName
    );
  } else {
    console.log(
      "setting timeout handler ",
      portName,
      retryCount,
      maxRetry,
      timeout
    );

    timerId = setTimeout(
      handler,
      timeout,
      {
        ...options,
        timeout,
        maxRetry,
      },
      ...args
    );
  }

  return {
    stopTimer() {
      if (timerId > 0) {
        clearTimeout(timerId);
        retryCount = 0;
      }
    },

    done() {
      return timerId < 0;
    },
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
function addPortListener(portName, portConf, observer) {
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
      let recordPort = false;

      if (!disabled) {
        // Listen for event that will invoke this port
        recordPort = addPortListener(portName, portConf, observer);
      }

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
            if (recordPort) {
              Model.getPortFlow(model).push(port);
            }

            // Signal the next task to run, unless undo is running
            if (!model.compensate && recordPort) {
              observer.notify(portConf.producesEvent, model);
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
