import Model from "./model";
import async from "../lib/async-error";
import domainEvents from "./domain-events";

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('./index').port} ports
 * @returns {function():Promise<void>}
 */
export default function compensate(model, ports) {
  return async function undo() {
    const changes = { ...model, compensate: true };
    const updated = await model.update(changes);
    const portFlow = Model.getPortFlow(model);

    updated.emit(domainEvents.undoStart(updated), updated);

    const undo = portFlow.reduceRight(async (model, port, index) => {
      const result = await async(ports[port].undo(model));
      if (result.ok) {
        return model.update({
          [Model.getKey("portFlow")]: portFlow.splice(0, index),
        });
      }
    }, updated);

    const msg =
      Model.getPortFlow(undo).length > 0
        ? domainEvents.undoFailed(model)
        : domainEvents.undoWorked(model);

    undo.emit(msg, undo);
  };
}
