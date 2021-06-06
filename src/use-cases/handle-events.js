import ModelFactory, { initRemote } from "../models";
import publishEvent from "../services/publish-event";
import EventBus from "../services/event-bus";
//import importRemoteModels from "../services"

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

    if (ModelFactory.getModelSpec(event.modelName)) {
      // Stream the code for the model
      await initRemote(event.modelName);
    }

    if (eventName.startsWith(CREATE) || eventName.startsWith(UPDATE)) {
      return ds.save(
        event.model.id,
        ModelFactory.loadModel(
          observer,
          datasource,
          event.model,
          event.modelName
        )
      );
    }

    if (eventName.startsWith(DELETE)) {
      return ds.delete(event.model.id);
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
    listen() {
      const models = ModelFactory.getModelSpecs();
      const rels = models.map(m => ({ ...m.relations }));

      const unregistered = rels.filter(
        u => !models.find(m => m.modelName === u.modelName)
      );

      unregistered.forEach(function (u) {
        EventBus.listen(BROADCAST, {
          callback: updateCache({
            observer,
            datasource: getDataSource(u.name),
          }),
          topic: BROADCAST,
          once: false,
          filters: [
            ModelFactory.getEventName(CREATE, u.modelName),
            ModelFactory.getEventName(UPDATE, u.modelName),
            ModelFactory.getEventName(DELETE, u.modelName),
          ],
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
  observer.on(/.*/, async event => publishEvent(event));
  // observer.on(/.*/, async event =>
  //   EventBus.notify({ topic: BROADCAST, event })
  // );

  // const cache = cacheEventHandler({ observer, getDataSource });
  // cache.listen();

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
