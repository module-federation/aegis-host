import DataSourceFactory from "../datasources";
import ModelFactory from "../models";
import publishEvent from "../services/publish-event";

/**
 *
 * @param {import('../models/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on(/.*/, async event => publishEvent(event, observer));

  /**
   * This is the cluster sync listener - when data is saved
   * in another process, the master forwards the data to
   * all the other workers, so they can update their cache.
   *
   */
  process.on("message", ({ cmd, id, pid, data, name }) => {
    if (cmd && id && data && process.pid !== pid) {
      if (cmd === "saveCommand") {
        const ds = DataSourceFactory.getDataSource(name);
        ds.save(id, ModelFactory.loadModel(observer, ds, data, name));
        return;
      }
      if (cmd === "deleteCommand") {
        const ds = DataSourceFactory.getDataSource(name);
        ds.save(id);
        return;
      }
    }
  });
  // console.debug({
  //   cmd,
  //   desc: "rehydrate and save",
  //   id,
  //   from: pid,
  //   to: process.pid,
  // });
}
