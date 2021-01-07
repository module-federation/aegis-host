"use strict";

import Model from "./model";

const errorActions = {

  retryAction: async function ({ portConf, portName, model }) {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const eventData = { portName, model };
    const retryTimeout = portConf.retryTimeout || FIFTEEN_MINUTES;
    const lastUpdate = model[Model.getKey("updateTime")];

    if (new Date().getTime() - lastUpdate < retryTimeout) {
      await model[portName](portConf.callback);
      model.emit("retryWorked", eventData);
      return;
    }
    model.emit("retryTimedOut", eventData);
    this.undoAction({ portName, model });
  },

  undoAction: async function ({ portName, model }) {
    const eventData = { portName, model };
    try {
      model.emit("compensating", eventData);
      await model.compensate();
      model.emit("compensateWorked", eventData);
    } catch (error) {
      model.emit("compensateFailed", { eventData, error });
    }
  },

  abortAction: () => process.abort()
}

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

  const timerId = setTimeout(
    () => errorActions["undoAction"](args), 
    EIGHT_MINUTES
  );

  const args = { model, portName, portConf, model, error, timerId };

  model.addListener(recvEventName, function ({ action, args }) {
    clearTimer(args.timerId);
    if (errorActions[action]) {
      errorActions[action](args);
      return;
    }
    model.emit("unknownErrorAction", { model, action });
  }, false);
  
  model.emit(sendEventName, args);
}