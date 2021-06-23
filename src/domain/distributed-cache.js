/**
 *
 * @param {{observer:Observer,datasource:DataSource}} param0
 * @returns
 */
export function updateCache({ datasource, observer, modelName }) {
  return async function ({ message }) {
    const event = JSON.parse(message);

    if (!event.eventName) return;

    console.debug("handle cache event", event.eventName);

    if (
      event.eventName.startsWith(CREATE) ||
      event.eventName.startsWith(UPDATE) ||
      event.eventName === domainEvents.remoteObjectLocated(modelName)
    ) {
      console.debug("check if we have the code for this object...");

      if (!ModelFactory.getModelSpec(modelName)) {
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

        const model = ModelFactory.loadModel(
          observer,
          datasource,
          event.model,
          modelName
        );

        await datasource.save(model.getId(), model);

        await observer.notify(
          domainEvents.remoteObjectLocated(modelName),
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
function searchCache(getDataSource) {
  return async function ({ message }) {
    const event = JSON.parse(message);

    // Listen for inquiries about this model
    const result = await relationType[event.relation.type](
      event.model,
      getDataSource(event.model.modelName),
      event.relation
    );

    console.debug("result", result);

    if (result) {
      // send the results back
      await EventBus.notify(
        domainEvents.remoteObjectLocated(event.model.modelName),
        JSON.stringify(result)
      );
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
export const cacheEventBroker = function ({ observer, getDataSource, uuid }) {
  return {
    /**
     * Forward local CRUD write events to event bus.
     */
    publishInternalEvents() {
      observer.on(/CREATE|UPDATE|DELETE|cacheLookup/, async event =>
        EventBus.notify(BROADCAST, JSON.stringify(event))
      );
    },

    /**
     * Subscribe to the event bus to receive remote CRUD events for
     * related models.
     *
     * Create listeners for each model we are running, so we
     * provide  service as well as receive it.
     */
    consumeExternalEvents() {
      const modelSpecs = ModelFactory.getModelSpecs();
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
          ModelFactory.getEventName(CREATE, modelName),
          ModelFactory.getEventName(UPDATE, modelName),
          ModelFactory.getEventName(DELETE, modelName),
          domainEvents.remoteObjectLocated(modelName),
        ].forEach(event =>
          EventBus.listen({
            topic: BROADCAST,
            id: uuid(),
            callback: updateCache({
              observer,
              datasource: getDataSource(modelName),
              modelName,
            }),
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
          callback: searchCache(getDataSource),
        })
      );
    },
  };
};