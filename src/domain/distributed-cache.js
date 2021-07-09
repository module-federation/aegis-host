"use strict";

import { relationType } from "./make-relations";
import ModelFactory, { importRemoteCache } from ".";
import domainEvents from "./domain-events";

/**
 * Implements distributed object cache. Find any model
 * referenced by a relation that is not registered in
 * the model factory and listen for remote CRUD events
 * from it. On receipt of the event, import the remote
 * modules for the model and its adapters/services, if
 * they haven't been already, then rehydrate and save
 * the model instance to the cache. Listen and forward
 * on-demand requests, i.e. cache misses.
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
  webswitch,
}) {
  let useWebswitch = true;

  function parse(message) {
    try {
      const event = useWebswitch ? message : JSON.parse(message);
      const eventName = event.eventName;
      const modelName = event.modelName;
      const model = event.model;
      const modelId = event.model.id;
      const relation = event.relation; // optional

      console.debug(eventName, modelName, model, modelId);

      if (!eventName || !modelName || !modelId || !model)
        throw new Error("invalid message format", message);

      return {
        eventName,
        modelName,
        model,
        modelId,
        relation,
      };
    } catch (e) {
      console.error("could not parse message", message);
    }
  }

  async function handleDelete(eventName, modelName, event) {
    if (
      eventName === models.getEventName(models.EventTypes.DELETE, modelName)
    ) {
      console.debug("deleting from cache", modelName, event.modelId);
      await datasources.getDataSource(modelName).delete(event.modelId);
      return true;
    }
    console.debug("not deleting");
    return false;
  }

  async function streamModelCode(modelName) {
    if (!models.getModelSpec(modelName)) {
      console.debug("we don't, import it...");
      // Stream the code for the model
      await importRemoteCache(modelName);
    }
  }

  function hydrateModel(model, datasource, modelName) {
    if (Array.isArray(model)) {
      return model.map(model =>
        models.loadModel(observer, datasource, model, modelName)
      );
    }
    return models.loadModel(observer, datasource, model, modelName);
  }

  async function saveModel(model, datasource) {
    if (Array.isArray(model))
      await Promise.all(model.map(m => datasource.save(m.getId(), m)));
    await datasource.save(model.id, model);
  }

  /**
   * Returns the callback run by the external event service when a message arrives.
   *
   * @param {function(string):string} parser
   * @param {function(object)} router
   * @returns {function(message):Promise<void>}
   */
  function updateCache(router) {
    return async function (message) {
      try {
        const event = parse(message);
        const { eventName, modelName, model } = event;
        console.debug("handle cache event", eventName);

        // if (handleDelete(eventName, modelName, event)) return;

        console.debug("check if we have the code for this object...");
        await streamModelCode(modelName);

        console.debug("unmarshal deserialized model(s)", modelName);
        const datasource = datasources.getDataSource(modelName);
        const hydratedModel = hydrateModel(model, datasource, modelName);

        console.debug("save model(s)");
        await saveModel(hydratedModel, datasource);

        if (router) router({ ...event, model: hydratedModel });
      } catch (e) {
        console.error("distributed cache error", e.message, message);
      }
    };
  }

  async function updateForeignKeys(event, model) {
    if (["manyToOne", "oneToOne"].includes(event.relation.type)) {
      await saveModel(
        hydrateModel({
          ...event.model,
          [event.relation.foreignKey]: model[0].getId(),
        })
      );
    } else if (event.relation.type === "oneToMany") {
      await Promise.all(
        model.map(async m =>
          m.update({ [event.relation.foreignKey]: m.model.id })
        )
      );
    }
  }

  async function createRelated(event) {
    const newModels = await Promise.all(
      event.args.map(async arg => {
        try {
          return await models.createModel(
            observer,
            datasources.getDataSource(event.relation.modelName),
            event.relation.modelName,
            arg
          );
        } catch (e) {
          throw new Error(createRelated.name, e.message);
        }
      })
    );
    return newModels;
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
   * @returns {Promise<{srcModel: import("./model").Model, error:Error}>}
   * Updated source model (model that defines the relation)
   */
  async function createRelatedObject(event) {
    if (!event.relation || !event.args || !event.args.length < 1) {
      console.info(createRelatedObject.name, "no relation or args", event);
      return event;
    }
    try {
      const newModels = createRelated(event);
      const relatedDs = datasources.getDataSource(event.relation.modelName);
      saveModel(newModels, relatedDs);
      updateForeignKeys(event, newModels);
    } catch (e) {
      throw new Error(createRelatedObject.name, e.message);
    }
  }

  /**
   * Returns function to search the cache.
   * @param {function(string):string} parser
   * @param {function(object)} router
   * @returns {function(message):Promise<void>} function that searches the cache
   */
  function searchCache(router) {
    return async function (message) {
      try {
        const event = parse(message);

        if (event.args) {
          await createRelatedObject(event);
        }

        // find the requessted object
        const related = await relationType[event.relation.type](
          event.model,
          datasources.getDataSource(event.relation.modelName),
          event.relation
        );

        if (related) {
          console.log("found object(s)", related);
          await router({
            ...event,
            model: related,
            modelName: related.getName(),
            modelId: related.getId(),
          });
          return;
        }
        console.log("no object(s) found");
      } catch (error) {
        console.warn(searchCache.name, error, message);
      }
    };
  }

  async function send(event) {
    if (useWebswitch) {
      console.debug("sending via webswitch");
      await webswitch(event);
    } else {
      console.debug("sending via event bus");
      await notify(event);
    }
  }

  async function subscribe(requestName, responseName) {
    const eventName = responseName;
    console.debug("eventName", eventName);

    if (useWebswitch) {
      observer.on(
        requestName,
        searchCache(event => webswitch({ ...event, eventName }))
      );
    } else {
      listen(
        requestName,
        searchCache(event => notify({ ...event, eventName }))
      );
    }
  }

  /**
   * connect to webswitch server and authenticate so we are listening
   */
  function initWebswitch() {
    useWebswitch = true;
    webswitch("webswitch");
  }

  /**
   * Subcribe to external CRUD events for related models.
   * Also listen for request and response events for locally
   * and remotely cached data.
   */
  function start() {
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

    console.debug("local models", localModels, "remote models", remoteModels);

    // Forward requests to, handle responses from, remote models
    remoteModels.forEach(function (modelName) {
      // listen for internal requests and forward
      observer.on(domainEvents.internalCacheRequest(modelName), event =>
        send({
          ...event,
          eventName: domainEvents.externalCacheRequest(modelName),
        })
      );

      // listen for external responses and forward internally
      observer.on(
        domainEvents.externalCacheResponse(modelName),
        updateCache(event =>
          observer.notify(domainEvents.internalCacheResponse(modelName), event)
        )
      );

      [
        // Subscribe to CRUD broadcasts from related, external models
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName => observer.on(eventName, updateCache()));
    });

    // Listen for cache search requests from external models.
    localModels.forEach(function (modelName) {
      subscribe(
        domainEvents.externalCacheRequest(modelName),
        domainEvents.externalCacheResponse(modelName)
      );

      [
        // Subcribe to local CRUD events and broadcast externally
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName =>
        observer.on(eventName, async event => send(event))
      );
    });
  }

  return {
    start,
    initWebswitch,
  };
}
