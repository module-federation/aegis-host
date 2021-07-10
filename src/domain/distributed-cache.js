"use strict";

import { relationType } from "./make-relations";
import { importRemoteCache } from ".";
import domainEvents from "./domain-events";
import makeArray from "./util/make-array";

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
      const modelId = event.id || event.modelId;
      const relation = event.relation; // optional
      const args = event.args; // optional;

      if (!eventName || !modelName || !modelId || !model)
        throw new Error("invalid message format");

      return {
        eventName,
        modelName,
        model,
        modelId,
        relation,
        args,
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
  /**
   * Fetch modelspec modules for `modelName` from repo.
   * @param {string} modelName
   */
  async function streamRemoteModules(modelName) {
    if (!models.getModelSpec(modelName)) {
      console.debug("we don't, import it...");
      // Stream the code for the model
      await importRemoteCache(modelName);
    }
  }

  /**
   * Unmarshal deserialized JSON object.
   * Checks if model is an array or object
   * @param {import("./model").Model|Array<import("./model").Model>} model
   * @param {import("./datasource").default} datasource
   * @param {string} modelName
   * @returns {import("./model").Model|Array<import("./model").Model>}
   */
  function hydrateModel(model, datasource, modelName) {
    if (Array.isArray(model)) {
      return model.map(m =>
        models.loadModel(observer, datasource, m, modelName)
      );
    }
    return models.loadModel(observer, datasource, model, modelName);
  }

  /**
   * Save model to cache.
   * Checks if model is an array or object
   * @param {*} model
   * @param {*} datasource
   */
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
        console.log(message);
        const event = parse(message);
        const { eventName, modelName, model, modelId } = event;
        console.debug("handle cache event", eventName);

        if (await handleDelete(eventName, modelName, event)) return;

        console.debug("check if we have the code for this object...");
        await streamRemoteModules(modelName);

        console.debug("unmarshal deserialized model(s)", modelName, modelId);
        const datasource = datasources.getDataSource(modelName);
        const hydratedModel = hydrateModel(model, datasource, modelName);

        console.debug("save model(s)");
        await saveModel(hydratedModel, datasource);

        if (router) router({ ...event, model: hydratedModel });
      } catch (e) {
        console.error("distributed cache error", e.message);
      }
    };
  }

  async function updateForeignKeys(event, datasrc, newModel) {
    if (["manyToOne", "oneToOne"].includes(event.relation.type)) {
      event.model[event.relation.foreignKey] == newModel.getId();
      const hydrated = hydrateModel(event.model, ds, event.model.modelName);
      datasrc.save(hydrated.getId(), hydrated);
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
   * @returns {Promise<{import("./model").Model, error:Error}>}
   * Updated source model (model that defines the relation)
   */
  async function createRelatedObject(event) {
    if (
      !event.args ||
      event.args.length < 1 ||
      !event.relation ||
      !event.modelName
    ) {
      return event;
    }
    try {
      const newModels = await createRelated(event);
      const relatedDs = datasources.getDataSource(event.relation.modelName);
      const requestDs = datasources.getDataSource(event.modelName);
      await saveModel(newModels, relatedDs);
      await updateForeignKeys(event, requestDs, newModels);
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

        // find the requessted object(s)
        const related = await relationType[event.relation.type](
          event.model,
          datasources.getDataSource(event.relation.modelName),
          event.relation
        );

        const rel = makeArray(related);
        if (!rel[0]) return;

        console.log("object(s) found");

        await router({
          model: rel.length < 2 ? rel[0] : rel,
          modelName: event.relation.modelName,
          modelId: rel[0].id || rel[0].getId(),
        });
      } catch (error) {
        console.warn(searchCache.name, error);
      }
    };
  }

  async function send(event) {
    if (useWebswitch) {
      await webswitch(event);
    } else {
      await notify(event);
    }
  }

  function subscribeResponse(responseName, internalResponseName) {
    const callback = updateCache(event =>
      observer.notify(internalResponseName, event)
    );
    if (useWebswitch) {
      observer.on(responseName, callback);
    } else {
      listen(responseName, callback);
    }
  }

  function subscribeRequest(requestName, responseName) {
    const eventName = responseName;

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

  const subscribeCrud = eventName =>
    useWebswitch
      ? observer.on(eventName, updateCache())
      : listen(eventName, updateCache());

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

      subscribeResponse(
        domainEvents.externalCacheResponse(modelName),
        domainEvents.internalCacheResponse(modelName)
      );

      [
        // Subscribe to CRUD broadcasts from related, external models
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(subscribeCrud);
    });

    // Listen for cache search requests from external models.
    localModels.forEach(function (modelName) {
      subscribeRequest(
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
