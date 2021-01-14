"use strict";

import Model from "./model";
import timeoutCallback from "./timeout-callback";
import errorCallback from "./error-callback";

const TIMEOUT_SECONDS = 60;

/**
 * Set an appropriate timeout interval and handler for the port.
 * @param {{
 *  portName: string,
 *  portConf: import('../models').ports,
 *  portFunc: function()
 * }} param0
 */
function setPortTimeout({ portName, portConf, model }) {
  // Set an appropriate timeout for the port
  const timeout = (portConf.timeout || TIMEOUT_SECONDS) * 1000;

  if (timeout === 0) {
    return 0;
  }

  const timerId = setTimeout(function () {
    console.error("port operation timed out: %s", portName);

    // Call the port's timeout handler if one is specified
    const handler = portConf.timeoutCallback || timeoutCallback;
    
    if (handler) {
      handler({
        model,
        portName,
        portConf,
      });
    }
  }, timeout);

  return timerId;
}

/**
 * Register an event handler that invokes the `port`.
 * @param {import('./index').Model} model
 * @returns {boolean} whether or not to remember this port
 * for compensation and restart
 */
function setPortEvent(portName, portConf, observer) {
  if (portConf.consumesEvent) {
    // listen for the triggering event to invoke this port
    observer.on(
      portConf.consumesEvent,
      async function (model) {
        try {
          // Invoke this port and pass a callack if one is specified
          await model[portName](portConf.callback);
        } catch (error) {
          throw new Error(error);
        }
      },
      false
    );
    return true;
  }
  return false;
}

/**
 *
 */
function handleError({ portName, portConf, model, error }) {
  console.error("port operation exception %s: %s", portName, error);

  // Call the port's error handler if one is specified
  const handler = portConf.errorCallback || errorCallback;

  if (handler) {
    console.error("invoking error callback");
    
    handler({
      model,
      error,
      portName,
      portConf,
    });
  }
}

function stopTimer(model, portConf, timerId) {
  const FIFTEEN_MINUTES = 15 * 60 * 60;
  const retryTimeout = portConf.retryTimeout || FIFTEEN_MINUTES;
  const lastUpdate = model[Model.getKey("updateTime")];
  const now = new Date().getTime();
  const totalSeconds = new Date(now - lastUpdate).getSeconds();
  
  if (totalSeconds > retryTimeout) {
    clearTimeout(timerId); 
    return true;
  }
  return false;
}

/**
 * Generate functions to handle I/O between
 * the domain and application layers. Each port
 * is assigned an adapter, which either invokes
 * the port (inbound) or is invoked by it (outbound).
 * Ports can be instrumented for exceptions and timeouts.
 * They can also be piped together in a control flow by
 * specifying the output event of one port as the input or
 * triggering event of another.
 *
 * See the `ModelSpecification` for port configuration options.
 *
 * @param {import('./index').ports} ports - object containing domain interfaces
 * @param {object} adapters - object containing application adapters
 * @param {import('../lib/observer').Observer} observer
 */
export default function makePorts(ports, adapters, observer) {
  if (!ports || !adapters) {
    console.warn("no ports or adapters configured");
    return;
  }

  return Object.keys(ports)
    .map(function (port) {
      const portName = port;
      const portConf = ports[port];
      const disabled = portConf.disabled || !adapters[port];
      let recordPort = false;

      if (disabled) {
        console.warn("warning: port disabled or adapter missing: %s", port);
      } else {
        // Listen for event that will invoke this port  
        recordPort = setPortEvent(portName, portConf, observer);
      }

      return {
        // The port function
        async [port](...args) {
          // If the port is disabled, return
          if (disabled) {
            return;
          }

          // Handle port timeouts
          const timerId = setPortTimeout({ portName, portConf, model: this });

          try {
            // Call the adapter and wait
            const model = await adapters[port]({ model: this, args });

            // Stop the timer
            clearTimeout(timerId);

            // Remember invocations for undo and restart
            if (recordPort) {
              Model.getPortFlow(model).push(port);
            }

            // Signal the next task to run, unless undo is running
            if (!model.undo && recordPort) {
              observer.notify(portConf.producesEvent, model);
            }
          } catch (error) {
            console.error(error);
            
            if (stopTimer(this, portConf, timerId)) {
              handleError({
                model: this,
                error,
                portName,
                portConf,
              });
            }
          }
        },
      };
    })
    .reduce((p, c) => ({
      ...c,
      ...p,
    }));
}
