"use strict";

import errorActions from "./error-actions";

/**
 * Default error handler:
 * Retries port every `port.retryInterval` seconds
 * for up to `port.retryTimeout` minutes.
 * Then attempts to reverse any previous transactions.
 * @param {{
 *  portName: string,
 *  portConf:import('./index').ports,
 *  model:import('./index').Model
 * }} param0
 */
export default async function errorCallback({ portName, portConf, model, error }) {
  console.warn("error handler called:", portName, error);

  const EIGHT_MINUTES = 8 * 60 * 60 * 1000;
  const sendEventName = `errorActionReq:${model.modelName}`;
  const recvEventName = `errorActionRsp:${model.modelName}`;
  const args = { model, portName, portConf, model, error };
  
  const timerId = setTimeout(
    () => errorActions.undoAction({ ...args, timerId }), 
    EIGHT_MINUTES
  );

  model.addListener(recvEventName, function ({ action, args }) {
    if (errorActions[action]) {
      clearTimer(args.timerId);
      errorActions[action](args);
      return;
    }
    console.log("unknown error action:", action);
  }, false);
  
  model.emit(sendEventName, args);
}