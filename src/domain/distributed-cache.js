"use strict";

import { relationType } from "./make-relations";
import { importRemoteCache } from ".";
import domainEvents from "./domain-events";

/**
 * Implement distributed object cache. Find any model
 * referenced by a relation that is not registered in
 * the model factory and listen for remote CRUD events
 * from it. On receipt of the event, import the remote
 * modules for the model and its adapters/services, if
 * they haven't been already, then rehydrate and save
 * the model instance to the cache.
 *
 * @param {{
 *  observer:import("./observer").Observer,
 *  getDataSource:import("./datasource").default#getDataSource,
 *  models:import("./model-factory").ModelFactory,
 *  listen:function(...args),
 *  notify:function(...args)
 * }} param0
 */
export default function DistributedCacheManager({
  models,
  observer,
  getDataSource,
  listen,
  notify,
}) {
  /**
   * Returns the callback run by the external event service when a message arrives.
   *
   * @param {{
   *  modelName:string,
   *  callback:function()
   * }} param0
   * @returns {function({message}):Promise<string>}
   */
  function updateCache({ modelName, callback }) {
    return async function ({ message }) {
      const event = JSON.parse(message);

      if (!event.eventName || !event.model) {
        console.warn("invalid message format", event);
        return;
      }

      console.debug("handle cache event", event.eventName);

      if (
        event.eventName ===
        models.getEventName(models.EventTypes.DELETE, modelName)
      ) {
        const datasource = getDataSource(event.modelName);
        console.debug("deleting from cache", event.modelName, event.modelId);
        return datasource.delete(event.modelId);
      }

      console.debug("check if we have the code for this object...");
      const datasource = getDataSource(modelName);

      if (!models.getModelSpec(modelName)) {
        console.debug("we don't, import it...");
        // Stream the code for the model
        await importRemoteCache(modelName);
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

        if (callback) await callback();
      } catch (e) {
        console.error("distributed cache", e);
      }
    };
  }

  async function evaluateSourceModel(event) {
    if (!event.args || !event.args.length > 0) {
      return event.model;
    }

    try {
      console.debug({ model: event.model, args: event.args });

      const modelArr = [];
      const dataSource = getDataSource(event.relation.modelName);

      event.args.forEach(async arg => {
        try {
          const model = await models.createModel(
            observer,
            dataSource,
            event.relation.modelName,
            arg
          );
          modelArr.push(model);
        } catch (e) {
          console.warn(evaluateSourceModel.name, e);
        }
      });

      if (!modelArr[0]) {
        console.warn("no model instance created");
        return event.model;
      }

      if (event.relation.type === "manyToOne") {
        return {
          ...event.model,
          [event.relation.foreignKey]: modelArr[0].getId(),
        };
      }

      if (event.relation.type === "oneToMany") {
        modelArr.forEach(
          async model =>
            await model.update({ [event.relation.foreignKey]: event.model.id })
        );
      }

      return event.model;
    } catch (e) {
      console.log(e);
      return event.model;
    }
  }

  /**
   *
   * @param {{callback:function()}} param0
   */
  function searchCache({ callback }) {
    return async function ({ message }) {
      const event = JSON.parse(message);

      if (!event || !event.relation) {
        console.error("invalid msg format", searchCache.name, event);
        return;
      }

      const sourceModel = await evaluateSourceModel(event);

      // find the requested object
      const model = await relationType[event.relation.type](
        sourceModel,
        getDataSource(event.relation.modelName),
        event.relation
      );

      if (model) {
        console.info("found object", model.modelName, model.getId());
        if (callback) {
          await callback({ model, relation: event.relation });
        }
        return;
      }
      console.warn("no object found");
    };
  }

  /**
   * Subcribe to external CRUD events for related models.
   * Also listen for request and response events for locally
   * and remotely cached data.
   */
  function startListening() {
    const modelSpecs = models.getModelSpecs();
    const registeredModels = modelSpecs.map(m => m.modelName);
    const unregisteredModels = [
      ...new Set( // deduplicate
        modelSpecs
          .filter(m => m.relations) // only models with relations
          .map(m =>
            Object.keys(m.relations)
              .filter(
                // filter out existing local models
                k => !registeredModels.includes(m.relations[k].modelName)
              )
              .map(k => m.relations[k].modelName)
          )
          .reduce((a, b) => a.concat(b))
      ),
    ];

    unregisteredModels.forEach(modelName => {
      observer.on(
        domainEvents.internalCacheRequest(modelName),
        async eventData =>
          await notify({
            ...eventData,
            eventName: domainEvents.externalCacheRequest(modelName),
          })
      );

      listen(
        domainEvents.externalCacheResponse(modelName),
        updateCache({
          modelName,
          callback: async eventData =>
            await observer.notify(
              domainEvents.internalCacheResponse(modelName),
              {
                ...eventData,
                eventName: domainEvents.internalCacheResponse(modelName),
              }
            ),
        })
      );

      [
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName => listen(eventName, updateCache({ modelName })));
    });

    registeredModels.forEach(modelName => {
      listen(
        domainEvents.externalCacheRequest(modelName),
        searchCache({
          callback: async eventData =>
            await notify({
              ...eventData,
              eventName: domainEvents.externalCacheResponse(modelName),
            }),
        })
      );
      [
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName =>
        observer.on(eventName, async eventData => await notify(eventData))
      );
    });
  }

  return {
    listen: startListening,
  };
}
