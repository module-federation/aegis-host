"use strict";

import errorActions from "./error-actions";

/**
 * Default timeout handler:
 * Retries port every `port.retryInterval` seconds
 * for up to `port.retryTimeout` minutes.
 * Then attempts to reverse any previous transactions.
 * @param {{
 *  portName: string,
 *  portConf:import('./index').ports,
 *  model:import('./index').Model
 * }} args
 */
export default async function retryCallback(args) {
  const { portName } = args;
  console.warn("timeout handler retrying port", portName);
  errorActions.retryAction(args);
}
