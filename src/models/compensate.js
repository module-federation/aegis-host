import Model from "./model";

/**
 * Returns an object with a function that replays the sequence
 * of port calls in LIFO order executing their undo functions
 * @param {import('./index').port} ports
 * @returns {function():Promise<void>}
 */
export default function compensate(ports) {
  const self = this;
  return async function compensateAsync() {
    const model = { ...self, undo: true };
    await model.save();
    let port = Model.getPortFlow(model).pop();
    while (port) {
      if (ports[port].undo) {
        await ports[port].undo(model);
      }
      port = Model.getPortFlow(model).pop();
    }
  };
}
