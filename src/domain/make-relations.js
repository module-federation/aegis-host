"use strict";

import domainEvents from "./domain-events";

const maxwait = process.env.REMOTE_OBJECT_MAXWAIT || 10000;

export const relationType = {
  /**
   * @todo implement cache miss for distributed cache
   *
   * @param {import("./model-factory").Model} model
   * @param {import("./datasource").default} ds
   * @param {import("./index").relations[relation]} rel
   */
  oneToMany: async (model, ds, rel) => {
    console.log({ model, ds, rel });
    const pk = model.id || model.getId();
    return ds.list({ [rel.foreignKey]: pk });
  },
  /**
   *
   * @param {import(".").Model} model
   * @param {import("./datasource").default} ds
   * @param {import("./index").relations[relation]} config
   */
  manyToOne: async (model, ds, rel) => await ds.find(model[rel.foreignKey]),
  /**
   * Same as many to one as far as the lookup.
   * @param {*} model
   * @param {*} ds
   * @param {*} rel
   * @returns
   */
  oneToOne(model, ds, rel) {
    return this.manyToOne(model, ds, rel);
  },
  /**
   * Used for transparent integration.
   * @param {*} model
   * @param {*} ds
   * @param {*} rel
   * @returns
   */
  oneToAny(model, ds, rel) {
    return ds.list({ count: 1 });
  },
};

/**
 * Retrieve a remote object from the distributed cache.
 * Sends a request message and receives a response from
 * the cache manager.
 *
 * If a relation specifies an object we don't have locally,
 * broadcast a global event that includes the relation details.
 * Other hosts subscribed to the relevant cache events will run
 * the relation to find the model instance. If found, it is sent
 * back to us in an event. The caller waits until this happens or
 * the operation times out.
 *
 * @param {import(".").relations[x]} relation
 * @param {import("./observer").Observer} observer
 * @returns
 */
export function requireRemoteObject(model, relation, observer) {
  const request = domainEvents.internalCacheRequest(relation.modelName);
  const results = domainEvents.internalCacheResponse(relation.modelName);
  const execute = fn => () => fn();

  return new Promise(async function (resolve) {
    setTimeout(resolve, maxwait);
    observer.on(results, execute(resolve));
    await observer.notify(request, { eventName: request, relation, model });
    console.debug("sent event", request);
    return request;
  });
}

/**
 * Generate functions to retrieve related domain objects.
 * @param {import("./index").relations} relations
 * @param {*} dataSource
 */
export default function makeRelations(relations, dataSource, observer) {
  if (Object.getOwnPropertyNames(relations).length < 1) return;

  return Object.keys(relations)
    .map(function (relation) {
      const rel = relations[relation];

      try {
        // relation type unknown
        if (!relationType[rel.type]) {
          console.warn("invalid relation", rel);
          return;
        }

        return {
          async [relation]() {
            let ds, requested;

            if (!dataSource.getFactory().hasDataSource(rel.modelName)) {
              console.warn("possible cache miss, check remote cache");
              ds = await dataSource
                .getFactory()
                .getDataSource(rel.modelName, true); // memory only

              requested = await requireRemoteObject(this, rel, observer);
            }
            ds = dataSource.getFactory().getDataSource(rel.modelName);

            const model = await relationType[rel.type](this, ds, rel);
            if (!model && !requested) {
              await requireRemoteObject(this, rel, observer);
            }

            if (!model) {
              return relationType[rel.type](this, ds, rel);
            }

            return model;
          },
        };
      } catch (e) {
        console.error(e);
      }
    })
    .reduce((c, p) => ({ ...p, ...c }));
}
