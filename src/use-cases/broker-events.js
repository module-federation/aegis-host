import publishEvent from "../services/publish-event";
import DistributedCacheManager from "../domain/distributed-cache";
import uuid from "../util/uuid";

/** @typedef {import("../domain/datasource").default} DataSource */
/** @typedef {import('../domain/observer').Observer} Observer */

/**
 * Handle internal and external events. Distributed cache.
 * @param {import('../domain/observer').Observer} observer
 * @param {function():DataSource} getDataSource
 */
export default function brokerEvents(observer, getDataSource, models) {
  observer.on(/.*/, async event => publishEvent(event));

  // Distributed object cache - must be explicitly enabled
  if (/true/i.test(process.env.DISTRIBUTED_CACHE_ENABLED)) {
    const broker = DistributedCacheManager({
      observer,
      getDataSource,
      models,
      uuid,
    });
    // do this later; let startup continue
    setTimeout(() => {
      broker.consumeExternalEvents();
      broker.publishInternalEvents();
    }, 1000);
  }

  /**
   * This is the cluster cache sync listener - when data is
   * saved in another process, the master forwards the data to
   * all the other workers, so they can update their cache.
   */
  process.on("message", ({ cmd, id, pid, data, name }) => {
    if (cmd && id && data && process.pid !== pid) {
      if (cmd === "saveCommand") {
        const ds = getDataSource(name);
        ds.clusterSave(id, data);
        return;
      }

      if (cmd === "deleteCommand") {
        const ds = getDataSource(name);
        ds.clusterDelete(id);
        return;
      }
    }
  });
}
