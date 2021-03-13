import async from "../lib/async-error";
import domainEvents from "./domain-events";

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('.').Model} model
 * @returns {function():Promise<void>}
 */
export default async function compensate(model) {
  const updated = await model.update({ compensate: true });
  const portFlow = model.getPortFlow();
  const ports = model.getSpec().ports;
  const PORTFLOW = model.getKey("portFlow");

  await updated.emit(domainEvents.undoStarted(updated), "compensate started");

  const undoResult = await portFlow.reduceRight(async (model, port, index) => {
    await async(ports[port].undo(model));
    if (model?.update) {
      return model.update({
        [PORTFLOW]: portFlow.splice(0, index),
      });
    }
  }, Promise.resolve(updated));

  console.log(undoResult);

  // const eventName =
  //   updated.getPortFlow().length > 0
  //     ? domainEvents.undoFailed(model)
  //     : domainEvents.undoWorked(model);

  // await undo.emit(eventName, "compensate finished");
}
