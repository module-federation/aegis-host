"use strict";

import { relationType } from "./make-relations";
import { importRemoteCache } from ".";
import domainEvents from "./domain-events";
import e from "express";

/**
 * Implements distributed object cache. Find any model
 * referenced by a relation that is not registered in
 * the model factory and listen for remote CRUD events
 * from it. On receipt of the event, import the remote
 * modules for the model and its adapters/services, if
 * they haven't been already, then rehydrate and save
 * the model instance to the cache.
 *
 * @param {{
 *  observer:import("./observer").Observer,
 *  datasources:import("./datasource-factory").DataSourceFactory,
 *  models:import("./model-factory").ModelFactory,
 *  listen:function(...args),
 *  notify:function(...args)
 * }} param0
 */
export default function DistributedCacheManager({
  models,
  observer,
  datasources,
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
        console.debug("deleting from cache", event.modelName, event.modelId);
        return datasources.getDataSource(event.modelName).delete(event.modelId);
      }

      console.debug("check if we have the code for this object...");

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

        const datasource = datasources.getDataSource(modelName);

        const model = models.loadModel(
          observer,
          datasource,
          event.model,
          modelName
        );

        await datasource.save(model.getId(), model);

        if (callback) await callback({ ...event, model });
      } catch (e) {
        console.error("distributed cache", e);
      }
    };
  }

  /**
   * Creates new, related models if relation function is called
   * with arguments, e.g.
   * ```js
   * const customer = await order.customer(customerDetails);
   * const customers = await order.customer(cust1, cust2);
   * ```
   *
   * @param {*} event
   * @returns
   */
  async function createRelatedObject(event) {
    if (!event.args || !event.args.length > 0) {
      return event.model;
    }

    try {
      const datasource = datasources.getDataSource(event.relation.modelName);

      const newModels = await Promise.all(
        event.args.map(async arg => {
          try {
            return await models.createModel(
              observer,
              datasource,
              event.relation.modelName,
              arg
            );
          } catch (e) {
            console.warn(createRelatedObject.name, e);
            return {
              model: event.model,
              error: e.message,
            };
          }
        })
      );

      if (!newModels[0]) {
        const error = "no model instance created";
        console.warn(error);
        return {
          model: event.model,
          error,
        };
      }

      const saved = await Promise.all(
        newModels.map(async model =>
          model ? datasource.save(model.getId(), model) : "error: no model"
        )
      );

      if (["manyToOne", "oneToOne"].includes(event.relation.type)) {
        return {
          ...event.model,
          [event.relation.foreignKey]: saved[0].getId(),
        };
      }

      if (event.relation.type === "oneToMany") {
        saved.forEach(
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
   * Search the cache
   * @param {{callback:function()}} param0
   */
  function searchCache({ callback }) {
    return async function ({ message }) {
      const event = JSON.parse(message);

      if (!event || !event.relation) {
        const error = "invalid message format";
        console.error(error, searchCache.name, event);
        return callback({
          model: event.model,
          relation: event.relation,
          error,
        });
      }

      try {
        const sourceModel = await createRelatedObject(event);
        if (sourceModel.error) {
          return callback({
            model: event.model,
            relation: event.relation,
            sourceModel: sourceModel.sourceModel,
            error: sourceModel.error,
          });
        }

        await datasources
          .getDataSource(sourceModel.modelName, true)
          .save(sourceModel.id, sourceModel);

        // find the requested object
        const model = await relationType[event.relation.type](
          sourceModel,
          datasources.getDataSource(event.relation.modelName),
          event.relation
        );

        if (model) {
          console.info("found object", model.getName(), model.getId());

          if (callback) {
            await callback({ model, relation: event.relation, sourceModel });
          }
          return;
        }
      } catch (error) {
        console.warn(error);
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
    const localModels = modelSpecs.map(m => m.modelName);
    const remoteModels = [
      ...new Set( // deduplicate
        modelSpecs
          .filter(m => m.relations) // only models with relations
          .map(m =>
            Object.keys(m.relations)
              .filter(
                // filter out existing local models
                k => !localModels.includes(m.relations[k].modelName)
              )
              .map(k => m.relations[k].modelName)
          )
          .reduce((a, b) => a.concat(b))
      ),
    ];

    // Forward requests to, handle responses from remote models
    remoteModels.forEach(function (modelName) {
      // listen for internal requests and forward
      observer.on(
        domainEvents.internalCacheRequest(modelName),
        async eventData =>
          await notify({
            ...eventData,
            eventName: domainEvents.externalCacheRequest(modelName),
          })
      );

      // listen for external responses and forward internally
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
        // Listen for CRUD write events from related models
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName => listen(eventName, updateCache({ modelName })));
    });

    // Listen for cache search requests from local models.
    localModels.forEach(function (modelName) {
      listen(
        domainEvents.externalCacheRequest(modelName),
        searchCache({
          callback: async eventData =>
            notify({
              ...eventData,
              eventName: domainEvents.externalCacheResponse(modelName),
            }),
        })
      );

      [
        // listen for internal CRUD write events and forward
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName =>
        observer.on(eventName, async eventData => notify(eventData))
      );
    });
  }

  return {
    listen: startListening,
  };
}
