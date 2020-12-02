import Model from "./model";

/**
 * Returns an object with a function that replays the sequence 
 * of port calls in LIFO order executing their undo functions
 * @param {import('./index').port} ports 
 */
export default function compensate(ports) {
  return {
    async compensate() {
      const model = { ...this, undo: true };
      model.save();

      let port = Model.getPortFlow(model).pop();
      while (port) {
        if (ports[port].undo) {
          await ports[port].undo(model);
        }
        port = Model.getPortFlow(model).pop();
      }
    }
  }
}

