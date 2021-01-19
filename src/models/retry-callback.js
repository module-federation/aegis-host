"use strict";

import async from "../lib/async-error";

const MAXRETRY = 10;
/**
 * Default timeout handler:
 * Retries port every `port.timeout` seconds
 * for up to `port.maxRetry` attempts.
 * @param {{
 *  portName: string,
 *  portConf:import('./index').ports,
 *  model:import('./index').Model
 * }} options
 */
export default async function retryCallback(options) {
  const {
    args: [retryCount, callback],
    port,
    portConf,
    model,
  } = options;

  const max = portConf.maxRetry || MAXRETRY;

  if (retryCount < max) {
    console.warn("timeout handler retrying port", port);
    await async(model[port](callback, retryCount++));
    return;
  }

  console.warn("max retries attempted without success", options);
  model.emit("retryFailed", options);
}
