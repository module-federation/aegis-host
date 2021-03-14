"use strict";

import async from "../lib/async-error";

/**
 * Check `portFlow` history and resume any workflow
 * that was running before we shut down.
 *
 * @param {function(Model):string[]} getPortFlow history of port calls
 * @param {import("../models").ports} ports
 * @returns {function(Map<string,Model>)}
 */
export default async function resumeWorkflow(list) {
  if (list?.length > 0) {
    await Promise.all(
      list.map(async function (model) {
        const history = model.getPortFlow();
        const ports = model.getSpec().ports;

        if (history?.length > 0 && !model.compensate) {
          const lastPort = history.length - 1;
          const nextPort = ports[history[lastPort]].producesEvent;

          if (nextPort && nextPort !== "workflowComplete") {
            await async(model.emit(nextPort, resumeWorkflow.name));
          }
        }
      })
    ).catch(error => console.error(error));
  }
}
