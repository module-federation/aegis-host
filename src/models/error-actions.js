"use strict";

import Model from "./model";

const RETRY_MINUTES = 15

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
    const retryMinutes = portConf.retryMinutes || RETRY_MINUTES;
    const lastUpdate = model[Model.getKey("updateTime")];
    const now = new Date().getTime();
    const totalMinutes = new Date(now - lastUpdate).getMinutes()

    console.log({ func: this.retryAction.name, totalMinutes, retryMinutes });

    if (totalMinutes < retryMinutes) {
      await model[portName](portConf.callback);
      model.emit("retryWorked", { portName, model });
      return;
    }
    model.emit("retryTimedOut", { portName, model });
    await this.undoAction({ portName, model });
  },

  /**
   * Backout transactions: execute compensating actions.
   * @param {*} param0
   */
  undoAction: async function ({ portName, model }) {
    const eventData = { portName, model };
    try {
      console.log("compensating", eventData);
      model.emit("compensating", eventData);
      await model.compensate();
      model.emit("compensateWorked", eventData);
    } catch (error) {
      console.error("compensateFailed", { eventData, error });
      model.emit("compensateFailed", { eventData, error });
    }
  },

  exitAction: () => process.exit(),
};

export default errorActions;
