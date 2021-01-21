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
    args: [callback, timerId],
    port,
    portConf,
    model,
    adapter,
  } = options;

  console.log({ func: retryCallback.name, options, portConf, retryCount });
  console.warn("timeout handler retrying port", port);
  await async(model[port](callback, timerId));
}
