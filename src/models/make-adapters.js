"use strict";

/**
 * In a hex arch, ports and adapters control I/O between
 * the application core (domain) and the outside world.
 * This function calls adapter factory functions, injecting
 * any service dependencies. Using module federation,
 * adapters and services are overridden at runtime to rewire
 * ports to their actual service entry points.
 * @param {port} ports - domain interfaces
 * @param {{[x:string]:function(*):function(*):any}} adapters - service adapters
 * @param {*} [services] - (micro-)services
 */
export default function makeAdapters(ports, adapters, services = {}) {
  if (!ports || !adapters) {
    return;
  }

  return Object.keys(ports)
    .map(port => {
      try {
        if (adapters[port] && !ports[port].disabled) {
          return {
            [port]: adapters[port](services[ports[port].service]),
          };
        }
      } catch (e) {
        console.warn(e.message);
      }
    })
    .reduce((p, c) => ({ ...p, ...c }));
}
