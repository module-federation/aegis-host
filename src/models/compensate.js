import Model from "./model";

export default function compensate(ports) {
  return {
    async compensate() {
      this.update({ orderStatus: 'COMPENSATE' });
      let port = Model.getPortFlow(this).pop();
      while (port) {
        if (ports[port].undo) {
          await ports[port].undo(this);
        }
        port = Model.getPortFlow(this).pop();
      }
    }
  }
}

