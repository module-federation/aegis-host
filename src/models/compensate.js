import async from "../lib/async-error";
import domainEvents from "./domain-events";

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('.').Model} model
 * @returns {function():Promise<void>}
 */
export default async function compensate(model) {
  try {
    const updated = await model.update({ compensate: true });
    const portFlow = model.getPortFlow();
    const ports = model.getSpec().ports;

    await updated.emit(domainEvents.undoStarted(updated), "undo started");

    const undoResult = await portFlow.reduceRight(
      async (_prev, port, index, arr) => {
        if (ports[port].undo) {
          console.log("calling undo on port: ", port);
          const result = await async(ports[port].undo(updated));
          if (result.ok) {
            return arr.splice(0, index);
          }
          throw new Error("undo failed on port: ", port, result.error);
        }
        return arr.splice(0, index);
      }
    );

    const eventName =
      undoResult.length === 0
        ? domainEvents.undoWorked(model)
        : domainEvents.undoFailed(model);

    await updated.emit(eventName, "undo finished");
    await updated.update({ compensateResult: eventName });
  } catch (error) {
    console.error(error);
    await model.emit(domainEvents.undoFailed(model), error.message);
  }
}
