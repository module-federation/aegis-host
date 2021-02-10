import async from "../lib/async-error";
import domainEvents from "./domain-events";

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('.').Model} model
 * @returns {function():Promise<void>}
 */
export default function compensate(model) {
  return async function undo() {
    const changes = { ...model, compensate: true };
    const updated = await model.update(changes);
    const portFlow = model.getPortFlow();
    const ports = model.getSpec().ports;

    updated.emit(domainEvents.undoStarted(updated), updated);

    const undo = portFlow.reduceRight(async (model, port, index) => {
      await async(ports[port].undo(model));
      return model.update({
        [model.getKey("portFlow")]: portFlow.splice(0, index),
      });
    }, updated);

    const msg =
      undo.getPortFlow().length > 0
        ? domainEvents.undoFailed(model)
        : domainEvents.undoWorked(model);

    undo.emit(msg, undo);
  };
}
