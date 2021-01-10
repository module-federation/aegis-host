"use strict";

import Model from "./model";

const RETRY_TIMEOUT = 15 * 60; // seconds

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
    const now = new Date().getTime();
    const lastUpdate = model[Model.getKey("updateTime")];

    const retryTimeout = portConf.retryTimeout || RETRY_TIMEOUT;
    const totalSeconds = new Date(now - lastUpdate).getSeconds();

    console.log({ func: this.retryAction.name, totalSeconds, retryTimeout });

    if (totalSeconds < retryTimeout) {
      await model[portName](portConf.callback);
    }
  },

  /**
   * Backout transactions: execute compensating actions.
   * @param {*} param0
   */
  undoAction: async function ({ portName, model }) {
    const eventData = { portName, model };
    console.log("reversing transactions", eventData);
    
    try {
      await model.compensate();
      console.log("compensate completed", eventData);
    } catch (error) {
      console.error("compensate failed", { eventData, error });
      model.emit("compensateFailed", { eventData, error });
    }
  },

  exitAction: () => process.exit(),
};

export default errorActions;
