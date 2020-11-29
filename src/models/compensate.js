import Model from "./model";

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

