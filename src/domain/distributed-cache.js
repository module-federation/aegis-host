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
