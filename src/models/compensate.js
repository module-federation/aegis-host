import Model from "./model";

/**
 * Steps through the sequence of port calls 
 * in LIFO order executing their undo functions.
 * @param {import('./index').port} ports
 * @returns {function():Promise<void>}
 */
export default function compensate(ports) {
  const self = this;
  
  return async function undo() {
    const model = { ...self, undo: true };
    const updated = await model.update();

    let port = Model.getPortFlow(updated).pop();
    while (port) {
      if (ports[port].undo) {
        await ports[port].undo(updated);
      }
      port = Model.getPortFlow(updated).pop();
    }
  };
}
