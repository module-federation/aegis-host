import ModelFactory, { initRemoteCache } from "../models";
import publishEvent from "../services/publish-event";
import EventBus from "../services/event-bus";

const BROADCAST = process.env.TOPIC_BROADCAST || "broadcastChannel";
const UPDATE = ModelFactory.EventTypes.UPDATE;
const CREATE = ModelFactory.EventTypes.CREATE;
const DELETE = ModelFactory.EventTypes.DELETE;

/**
 *
 * @param {*} param0
 * @returns
 */
export function updateCache({ datasource, observer }) {
  return async function ({ message }) {
    const event = JSON.parse(message);

    console.log("updateCache called", event.eventName);

    if (
      event.eventName.startsWith(CREATE) ||
      event.eventName.startsWith(UPDATE)
    ) {
      console.debug("check if we have the code for this object...");
      if (!ModelFactory.getModelSpec(event.modelName)) {
        console.debug("we don't, import it...");
        // Stream the code for the model
        await initRemoteCache(event.modelName);
      }

      console.debug("unmarshal the deserialized model");
      const model = ModelFactory.loadModel(
        observer,
        datasource,
        event.model,
        event.modelName
      );
      return datasource.save(model.getId(), model);
    }

    if (event.eventName.startsWith(DELETE)) {
      return datasource.delete(event.modelId);
    }
  };
}

/**
 * Implement distributed object cache. Find any model
 * referenced by a relation that is not registered in
 * the model factory and listen for remote CRUD events
 * from it. On receipt of the event, import the remote
 * modules for the model and its adapters/services, if
 * they haven't been already, then rehydrate and load
 * the model into the cache.
 */
export const cacheEventHandler = function ({ observer, getDataSource }) {
  return {
    notify() {
      observer.on(/CREATE|UPDATE|DELETE/, async event =>
        EventBus.notify(BROADCAST, JSON.stringify(event))
      );
    },
    listen() {
      const models = ModelFactory.getModelSpecs();
      const relations = models.map(m => ({ ...m.relations }));
      const unregistered = relations.filter(
        r => !models.find(m => m.modelName === r.modelName)
      );
      unregistered.forEach(function (u) {
        Object.keys(u).forEach(k => {
          console.debug("modelName", u[k].modelName);
          if (!u[k] || !u[k].modelName) return;
          const datasource = getDataSource(u[k].modelName);
          console.debug("calling listen", u[k]);

          EventBus.listen({
            topic: BROADCAST,
            id: new Date().getTime() + "create",
            callback: updateCache({ observer, datasource }),
            once: false,
            filters: [CREATE.concat(u[k].modelName).toUpperCase()],
          });
          EventBus.listen({
            topic: BROADCAST,
            id: new Date().getTime() + "update",
            callback: updateCache({ observer, datasource }),
            once: false,
            filters: [UPDATE.concat(u[k].modelName).toUpperCase()],
          });
          EventBus.listen({
            topic: BROADCAST,
            id: new Date().getTime() + "delete",
            callback: updateCache({ observer, datasource }),
            once: false,
            filters: [DELETE.concat(u[k].modelName).toUpperCase()],
          });
        });
      });
    },
  };
};

/**
 *
 * @param {import('../models/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer, getDataSource) {
  //observer.on(/.*/, async event => publishEvent(event));

  // Distributed object cache - must be explicitly enabled
  if (/true/i.test(process.env.DISTRIBUTED_CACHE_ENABLED)) {
    const cache = cacheEventHandler({ observer, getDataSource });
    cache.listen();
    cache.notify();
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
