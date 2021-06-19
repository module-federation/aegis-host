import ModelFactory, { initRemoteCache } from "../models";
import publishEvent from "../services/publish-event";
import EventBus from "../services/event-bus";
import domainEvents from "../models/domain-events";
import { relationType } from "../models/make-relations";
const os = require("os");

const BROADCAST = process.env.TOPIC_BROADCAST || "broadcastChannel";
const UPDATE = ModelFactory.EventTypes.UPDATE;
const CREATE = ModelFactory.EventTypes.CREATE;
const DELETE = ModelFactory.EventTypes.DELETE;

/** @typedef {import("../datasources/datasource").default} DataSource */
/** @typedef {import('../models/observer').Observer} Observer */

/**
 *
 * @param {{observer:Observer,datasource:DataSource}} param0
 * @returns
 */
export function updateCache({ datasource, observer }) {
  return async function ({ message }) {
    const event = JSON.parse(message);
    if (!event.eventName) return;
    console.debug("handle cache event", event.eventName);
    const remoteCacheHit = domainEvents.remoteObjectLocated(event.modelName);

    if (
      event.eventName.startsWith(CREATE) ||
      event.eventName.startsWith(UPDATE) ||
      event.eventName === remoteCacheHit
    ) {
      console.debug("check if we have the code for this object...");

      if (!ModelFactory.getModelSpec(event.modelName)) {
        console.debug("we don't, import it...");
        // Stream the code for the model
        await initRemoteCache(event.modelName);
      }

      try {
        console.debug(
          "unmarshal deserialized model",
          event.modelName,
          event.model.id
        );

        const model = ModelFactory.loadModel(
          observer,
          datasource,
          event.model,
          event.modelName
        );

        const saved = await datasource.save(model.getId(), model);

        if (event.eventName === remoteCacheHit) {
          await observer.notify(remoteCacheHit, event);
        }
        return saved;
      } catch (e) {
        console.error("distributed cache", e);
      }
    }

    if (event.eventName.startsWith(DELETE)) {
      console.debug("deleting from cache", event.modelName, event.modelId);
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
 * they haven't been already, then rehydrate and save
 * the model instance to the cache.
 *
 * @param {{observer:Observer,getDataSource:function():DataSource}} options
 */
export const cacheEventBroker = function ({ observer, getDataSource }) {
  return {
    /**
     * Forward local CRUD write events to event bus.
     */
    publishInternalEvents() {
      observer.on(/CREATE|UPDATE|DELETE|remoteObjectInquiry/, async event =>
        EventBus.notify(BROADCAST, JSON.stringify(event))
      );
    },

    /**
     * Subscribe to event bus to receive remote CRUD events.
     */
    consumeExternalEvents() {
      const models = ModelFactory.getModelSpecs();
      const relations = models.map(m => ({ ...m.relations }));
      const unregistered = relations.filter(
        r => !models.find(m => m.modelName === r.modelName)
      );
      // Look for unregistered models in relations
      unregistered.forEach(function (u) {
        Object.keys(u).forEach(function (r) {
          const relation = u[r];
          const modelName = relation.modelName;

          if (!modelName) return;

          const datasource = getDataSource(modelName);
          [
            ModelFactory.getEventName(CREATE, modelName),
            ModelFactory.getEventName(UPDATE, modelName),
            ModelFactory.getEventName(DELETE, modelName),
            domainEvents.remoteObjectLocated(modelName),
          ].forEach(event =>
            EventBus.listen({
              topic: BROADCAST,
              id: new Date().getTime() + event,
              callback: updateCache({ observer, datasource }),
              once: false,
              filters: [event],
            })
          );
        });
      });

      // Listen for remote inquiries for the models we have
      models.forEach(model =>
        EventBus.listen({
          topic: BROADCAST,
          once: false,
          filters: [domainEvents.remoteObjectInquiry(model.modelName)],
          id: new Date().getTime() + model.modelName,
          callback: function ({ message }) {
            const event = JSON.parse(message);
            // simply forward the event to local bus
            observer.notify(event.eventName, event);
          },
        })
      );
    },
  };
};

/**
 * Handle internal and external events. Distributed cache.
 * @param {import('../models/observer').Observer} observer
 * @param {function():DataSource} getDataSource
 */
export default function brokerEvents(observer, getDataSource) {
  observer.on(/.*/, async event => publishEvent(event));

  // Distributed object cache - must be explicitly enabled
  if (/true/i.test(process.env.DISTRIBUTED_CACHE_ENABLED)) {
    const broker = cacheEventBroker({ observer, getDataSource });
    // do this later; let startup continue
    setTimeout(() => {
      broker.publishInternalEvents();
      broker.consumeExternalEvents();
    }, 3000);
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
