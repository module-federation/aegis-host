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

    const undoneModel = await Promise.resolve(
      portFlow.reduceRight(async function (model, port, index, arr) {
        if (ports[port].undo) {
          console.log("calling undo on port: ", port);
          try {
            const undone = (await ports[port].undo(model)) || model;
            return undone.then(model =>
              model.update({
                [undone.getKey("portFlow")]: arr.splice(0, index),
              })
            );
          } catch (error) {
            console.error(error);
            return model;
          }
        }
        return model;
      }, updatedModel)
    );

    if (undoneModel.getPortFlow().length > 0) {
      const lastPort = undoneModel.getPortFlow();
      const msg = "undo incomplete, last port compensated " + lastPort;

      const model = await undoneModel.update({
        lastPort,
        compensateResult: "INCOMPLETE",
      });

      await model.emit(domainEvents.undoFailed(model), msg);
      console.error(msg, updatedModel);
      return;
    }

    const compensateResult = "COMPLETE";
    await undoneModel.emit(domainEvents.undoWorked(model), compensateResult);
    await undoneModel.update({ compensateResult });
  } catch (error) {
    console.error(error);
    await model.emit(domainEvents.undoFailed(model), error.message);
  }
}
