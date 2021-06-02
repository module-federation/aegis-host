import DataSourceFactory from "../datasources";
import ModelFactory from "../models";
import publishEvent from "../services/publish-event";
import { EventBus } from "microservices/event-bus";

const broadcast = process.env.TOPIC_BROADCAST || "broadcastChannel";

/**
 *
 * @param {*} param0
 * @returns
 */
export function updateCache({ message }) {
  const event = JSON.parse(message);
  const ds = DataSourceFactory.getDataSource(event.modelName);

  if (
    eventName.startsWith(models.EventTypes.CREATE) ||
    eventName.startsWith(models.EventTypes.UPDATE)
  ) {
    ds.save(model.id, ModelFactory.loadModel(event.eventData, model.modelName));
    return;
    ca;
  }

  if (eventName.startsWith(models.EventTypes.DELETE)) {
    ds.delete(model.id, ModelFactory.loadModel(eventData, model.modelName));
    return;
  }
}

/**
 * Implement distributed object cache cache. Find
 * any model referenced by a relation that is not
 * registered in the model factory and listen for remote
 * CRUD events from it. On startup, optionally load the
 * remote data source up to the cache limit - or load
 * on cache misses.
 */
export const cacheEventHandler = {
  models: ModelFactory.getModelSpecs(),
  rels: models.map(m => ({ ...m.relations })),

  // Are there relations to other models not registered with us?
  listen() {
    const unregistered = this.rels.filter(
      u => !this.models.find(m => m.modelName === u.modelName)
    );

    unregistered.forEach(function (u) {
      EventBus.listen(broadcast, {
        callback: updateCache,
        topic: broadcast,
        once: false,
        filters: [
          ModelFactory.getEventName(
            ModelFactory.EventTypes.CREATE,
            u.modelName
          ),
          ModelFactory.getEventName(
            ModelFactory.EventTypes.UPDATE,
            u.modelName
          ),
          ModelFactory.getEventName(
            ModelFactory.EventTypes.DELETE,
            u.modelName
          ),
        ],
      });
    });
  },
};

/**
 *
 * @param {import('../models/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on(/.*/, async event => publishEvent(event, observer));
  observer.on(/.*/, async event => EventBus.notify({ broadcast, event }));
  /**
   * Manage distributed cache
   */
  cacheEventHandler.listen();

  /**
   * This is the cluster cache sync listener - when data is
   * saved in another process, the master forwards the data to
   * all the other workers, so they can update their cache.
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
