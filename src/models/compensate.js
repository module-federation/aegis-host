import Model from "./model";
import async from "../lib/async-error";
import sleep from "../lib/sleep";

const TWO_MINUTES = 2 * 60 * 1000;
const MAX_RETRIES = 10;

function retryOnTimeout(retryCount, { ports, port, model }) {
  return async function () {
    if (retryCount > MAX_RETRIES) {
      console.lop("max retries reached", port, model);
      return;
    }
    const result = await async(ports[port].undo(model));

    if (!result.ok) {
      console.log("retry failed", result, port);
      sleep(TWO_MINUTES);
      compensate(model, ports)(retryCount++);
    }
  };
}

/**
 * Steps through the sequence of port calls
 * in LIFO order executing their undo functions.
 * @param {import('./index').port} ports
 * @returns {function():Promise<void>}
 */
export default function compensate(model, ports) {
  return async function undo(retryCount = 0) {
    const changes = { ...model, compensate: true };
    const updated = await model.update(changes);
    let port = Model.getPortFlow(updated).pop();

    while (port) {
      if (ports[port].undo) {
        const timerId = setTimeout(
          retryOnTimeout(retryCount, { ports, port, model }),
          TWO_MINUTES
        );

        const result = await async(ports[port].undo(updated));
        if (result.ok) {
          clearTimer(timerId);
        }
      }
      port = Model.getPortFlow(updated).pop();
    }
  };
}
