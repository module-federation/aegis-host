"use strict";

import Model from "./model";

/**
 * Default timeout handler: 
 * Retries port every `port.retryInterval` seconds 
 * for up to `port.retryTimeout` minutes.
 * Then attempts to reverse any previous transactions.
 * @param {{
 *  portName: string,
 *  portConf:import('./index').ports,
 *  model:import('./index').Model
 * }} param0
 */
export default async function timeoutCallback({ portName, portConf, model }) {
  console.warn("timeout handler called:", portName);
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const eventData = { portName, model };

  console.warn("retrying port function:", portName);
  model.emit("retryPort", model);

  const retryTimeout = portConf.retryTimeout || FIFTEEN_MINUTES;
  const lastUpdate = model[Model.getKey("updateTime")];

  if (new Date().getTime() - lastUpdate < retryTimeout) {
    await model[portName](portConf.callback);
    model.emit("retryWorked", eventData);
    return;
  }
  model.emit("retryTimedOut", eventData);
  console.error(
    "port retry attempts failed: attempting to reverse transactions"
  );

  try {
    model.emit("compensating", eventData);
    model.compensate();
    model.emit("compensateWorked", eventData);
  } catch (error) {
    model.emit("compensateFailed", eventData);
  }
}
