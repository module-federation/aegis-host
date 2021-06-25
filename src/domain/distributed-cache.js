"use strict";

import { relationType } from "./make-relations";
import { initRemoteCache } from ".";
import domainEvents from "./domain-events";
import EventBus from "../services/event-bus";

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
const DistributedCacheManager = function ({
  models,
  observer,
  getDataSource,
  uuid,
}) {
  const BROADCAST = process.env.TOPIC_BROADCAST || "broadcastChannel";
  const UPDATE = models.EventTypes.UPDATE;
  const CREATE = models.EventTypes.CREATE;
  const DELETE = models.EventTypes.DELETE;

  /**
   * Returns the callback run by the external event service when a message arrives.
   *
   * @param {{observer:Observer,datasource:DataSource}} param0
   * @returns {function({message}):Promise<string>}
   */
  function updateCache({ modelName }) {
    return async function ({ message }) {
      const event = JSON.parse(message);

      if (!event.eventName) {
        console.warn("missing eventname", event);
        return;
      }

      console.debug("handle cache event", event.eventName);

      if (
        event.eventName.startsWith(CREATE) ||
        event.eventName.startsWith(UPDATE) ||
        event.eventName === domainEvents.remoteObjectLocated(modelName)
      ) {
        console.debug("check if we have the code for this object...");
        const datasource = getDataSource(modelName);

        if (!models.getModelSpec(modelName)) {
          console.debug("we don't, import it...");
          // Stream the code for the model
          await initRemoteCache(modelName);
        }

        try {
          console.debug(
            "unmarshal deserialized model",
            modelName,
            event.model.id
          );

          const model = models.loadModel(
            observer,
            datasource,
            event.model,
            modelName
          );

          await datasource.save(model.getId(), model);

          await observer.notify(
            domainEvents.cacheLookupResults(modelName),
            event
          );
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
   *
   * @param {*} param0
   */
  async function searchCache({ message }) {
    const event = JSON.parse(message);
    console.debug("searchCache", event);

    // Listen for inquiries about this model
    const model = await relationType[event.relation.type](
      event.model,
      getDataSource(event.relation.modelName),
      event.relation
    );

    console.debug("result", model);

    if (model) {
      const eventName = domainEvents.remoteObjectLocated(
        event.relation.modelName
      );
      // send the results back
      await EventBus.notify(BROADCAST, JSON.stringify({ eventName, model }));
    }
  }

  function consumeExternalEvents() {
    const modelSpecs = models.getModelSpecs();
    const modelNames = modelSpecs.map(m => m.modelName);
    const modelCache = modelSpecs
      .filter(m => m.relations) // only models with relations
      .map(m =>
        Object.keys(m.relations).filter(
          // filter out existing local models
          k => !modelNames.includes(m.relations[k].modelName)
        )
      )
      .reduce((a, b) => a.concat(b));

    console.debug({ modelNames, modelCache });

    [...new Set(modelCache)].forEach(function (modelName) {
      [
        models.getEventName(CREATE, modelName),
        models.getEventName(UPDATE, modelName),
        models.getEventName(DELETE, modelName),
        domainEvents.remoteObjectLocated(modelName),
      ].forEach(event =>
        EventBus.listen({
          topic: BROADCAST,
          id: uuid(),
          callback: updateCache({ modelName }),
          once: false,
          filters: [event],
        })
      );
    });

    // Listen for external requests to find model instances we've created
    modelSpecs.forEach(spec =>
      EventBus.listen({
        topic: BROADCAST,
        once: false,
        filters: [domainEvents.cacheLookupRequest(spec.modelName)],
        id: Date.now() + spec.modelName,
        callback: searchCache,
      })
    );
  }

  function publishInternalEvents() {
    observer.on(/CREATE|UPDATE|DELETE|cacheLookup/, async event =>
      EventBus.notify(BROADCAST, JSON.stringify(event))
    );
  }

  return {
    /**
     * Forward local CRUD write events to event bus.
     */
    publishInternalEvents,

    /**
     * Subscribe to the event bus to receive remote CRUD events for
     * related models.
     *
     * Create listeners for each model we are running, so we
     * provide that service to the cache.
     */
    consumeExternalEvents,
  };
};

export default DistributedCacheManager;
