'use strict'

import Event from './event';

/**
 * Generate functions to handle I/O between
 * the domain and application layers. Each port
 * is assigned an adapter, which either invokes
 * the port (inbound) or is invoked by it (outbound).
 * Ports can be instrumented for exceptions and timeouts.
 * See the `ModelSpecification` for port configuration options.
 * 
 * @param {object} ports - object containing domain interfaces 
 * @param {object} adapters - object containing application adapters 
 * @param {import('../lib/observer').Observer} observer
 */
export default function makePorts(ports, adapters, observer) {
  if (!ports || !adapters) {
    console.warn('no ports or adapters configured')
    return;
  }
  return Object.keys(ports).map(function (port) {
    const disabled = ports[port].disabled || !adapters[port];

    if (disabled) {
      console.warn('warning: port disabled or adapter missing: %s', port);
    } else {
      // listen for the triggering event to invoke this port
      observer.on(, function (model) {
        console.log('handling event...', port, model);
        // Invoke this port and pass a callack if one is specified
        model[port](ports[port].callback);
      });
    }

    return {

      // The port function
      async [port](...args) {
        const self = this;

        // Return a promise 
        return new Promise(async function (resolve, reject) {

          // If the port is disabled, resolve and return
          if (disabled) {
            resolve(self);
            return;
          }

          // Set an appropriate timeout for the port 
          const timeout = ports[port].timeout || 60000;

          let timerId;
          if (timeout > 0) {
            timerId = setTimeout(function () {
              console.error('port operation timed out: %s', port);

              // Call the port's timeout handler if one is specified
              const timeoutCallback = ports[port].timeoutCallback
              if (timeoutCallback) {
                timeoutCallback({
                  port,
                  model: self
                });
              }
            }, timeout);
          }

          try {
            // Don't block the caller while we wait
            resolve(self);

            // Call the adapter and wait
            await adapters[port]({ model: self, args });

            clearTimeout(timerId);

            // Signal the next task to run 
            observer.notify(ports[port].producesEvent, self);

          } catch (error) {
            reject(error);
            console.error(
              'port operation exception %s: %s',
              port,
              error.message
            );

            // Call the port's error handler if one is specified
            const errorCallback = ports[port].errorCallback;
            if (errorCallback) {
              errorCallback({
                port,
                model: self
              });
            }
            throw new Error(error);
          }
        });
      }
    }
  }).reduce((p, c) => ({
    ...c,
    ...p
  }));
}