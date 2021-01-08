"use strict";

import Model from "./model";

/**
 * @name errorActions
 */
const errorActions = {
  /**
   * Retry port function.
   * @param {{
   *  portName:string,
   *  portConf:import('../models').ports,
   *  model:import('../models').Model
   * }} param0 
   */
  retryAction: async function ({ portConf, portName, model }) {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const retryTimeout = portConf.retryTimeout || FIFTEEN_MINUTES;
    const lastUpdate = model[Model.getKey("updateTime")];
    const eventData = { portName, model };

    if (new Date().getTime() - lastUpdate < retryTimeout) {
      await model[portName](portConf.callback);
      model.emit("retryWorked", eventData);
      return;
    }
    model.emit("retryTimedOut", eventData);
    await this.undoAction({ portName, model });
  },

  /**
   * Backout transactions: execute compensating actions.
   * @param {*} param0 
   */
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

  abortAction: () => process.abort(),
};

export default errorActions;