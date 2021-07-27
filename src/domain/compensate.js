import domainEvents from "./domain-events";

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('.').Model} model
 * @returns {function():Promise<void>}
 */
export default async function compensate(model) {
  try {
    const updatedModel = await model.update({ compensate: true });
    const portFlow = model.getPortFlow();
    const ports = model.getPorts();

    await updatedModel.emit(
      domainEvents.undoStarted(updatedModel),
      "undo starting"
    );

    const undoModel = await Promise.resolve(
      portFlow.reduceRight(async function (model, port, index, arr) {
        if (ports[port].undo) {
          console.log("calling undo on port: ", port);

          try {
            return model.then(async function (model) {
              await ports[port].undo(model);

              return model.update({
                [model.getKey("portFlow")]: arr.splice(0, index),
              });
            });
          } catch (error) {
            console.error(error);
          }
        }
        return model;
      }, Promise.resolve(updatedModel))
    );

    if (undoModel.getPortFlow().length > 0) {
      await model.emit(domainEvents.undoFailed(model), msg);
      const model = await undoModel.update({
        compensateResult: "INCOMPLETE",
      });
      return;
    }

    await undoModel.update({ compensateResult: "COMPLETE" });
    await undoModel.emit(domainEvents.undoWorked(model), compensateResult);
  } catch (error) {
    await model.emit(domainEvents.undoFailed(model), error.message);
    console.error(error);
  }
}
