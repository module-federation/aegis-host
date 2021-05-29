import DataSourceFactory from "../datasources";
import ModelFactory from "../models";
import publishEvent from "../services/publish-event";

streamCachedModelCode = function () {};

function updateCache(event) {
  // const ds = DataSourceFactory.getDataSource(event.eventName);
  // if (eventName.contains(models.eventTypes.UPDATE)) {
  //   eventName.modelData.srcUrl
  //   ds.save(event.modelData.id, dis );
  //   return;
  // }
  //   ds.delete(event.eventData.modelData.id);
}

/**
 * Distributed cache event handler. Find any model
 * referenced by a relationship that is not registered
 * in the model factory and listen for remote CRUD events
 * from it. On startup, optionally load the remote data
 * source up to the cache limit - or load based on cache
 * misses.
 *
 * @param {*} models list of all imported models
 * @returns
 */
const cacheEventHandler = function (models) {
  // Are there relations to other models not registered with us?
  return {
    listen(observer) {
      models.forEach(function (m) {
        const relations = m.getModelSpec().relations;
        if (relations) {
          const localModel = Object.keys(relations).find(r =>
            models.find(m2 => m2.modelName === relations[r].modelName)
          );
          if (!localModel) {
            observer.on(m2.modelName, updateCache);
          }
        }
      });
    },
  };
};

/**
 *
 * @param {import('../models/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on(/.*/, async event => publishEvent(event, observer));

  const cacheHandler = cacheEventHandler(ModelFactory.getRemoteModels());
  cacheHandler.listen(observer);

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
        ds.clusterSave(id, ModelFactory.loadModel(observer, ds, data, name));
        return;
      }
      if (cmd === "deleteCommand") {
        const ds = DataSourceFactory.getDataSource(name);
        ds.clusterDelete(id);
        return;
      }
    }
  });
}
