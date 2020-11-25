'use strict'

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
 */
export default function makePorts(ports, adapters) {
  if (!ports || !adapters) {
    console.warn('no ports or adapters configured')
    return;
  }
  return Object.keys(ports).map(function (port) {
    const disabled = ports[port].disabled || !adapters[port];

    if (disabled) {
      console.warn(
        'warning: port disabled or adapter missing: %s',
        port
      );
    }
    return {

      // The port function
      async [port](...args) {
        const self = this;

        // Return a promise for the adapter or domain to resolve
        return new Promise(async function (resolve, reject) {

          // If the port is disabled, resolve and return
          if (disabled) {
            resolve(self);
            return;
          }

          // Set an appropriate timeout for the interface 
          const timeout = ports[port].timeout || 60000;

          let timerId;
          if (timeout > 0) {
            timerId = setTimeout(function () {
              resolve(self);
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
            // If true, the adapter resolves, otherwise domain callback does
            const resolvePromise = ports[port].resolvePromise;
            const delegateCallback = ports[port].delegateCallback;

            // Call the adapter and pass it`resolve`
            // so it can decide when we are done.
            const promise = adapters[port]({
              delegateCallback,
              resolvePromise,
              model: self,
              resolve: () => console.log('resolve'),
              reject,
              args
            });

            if (resolvePromise) {
              console.log('resolving...', port);
              resolve(self);
            } else {
              console.log('awaiting...', port);
              await promise;
              resolve(self);
            }

            clearTimeout(timerId);

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
