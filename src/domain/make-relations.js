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
   *
   * @param {*} model
   * @param {*} ds
   * @param {*} rel
   */
  oneToOne(model, ds, rel) {
    return this.manyToOne(model, ds, rel);
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
export function requireRemoteObject(model, relation, observer, ...args) {
  const eventName = domainEvents.internalCacheRequest(relation.modelName);
  const results = domainEvents.internalCacheResponse(relation.modelName);
  const execute = resolve => async event => resolve(event.sourceModel);

  return new Promise(async function (resolve) {
    setTimeout(resolve, maxwait);
    observer.on(results, execute(resolve));
    await observer.notify(eventName, { eventName, relation, model, args });
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
          async [relation](...args) {
            let ds, updated;

            if (!dataSource.getFactory().hasDataSource(rel.modelName)) {
              console.warn("possible cache miss, check remote cache");

              ds = await dataSource
                .getFactory()
                .getDataSource(rel.modelName, true); // memory only
              updated = await requireRemoteObject(this, rel, observer, ...args);
              dataSource.save(updated.id, updated);
            }
            ds = dataSource.getFactory().getDataSource(rel.modelName);
            const model = await relationType[rel.type](this, ds, rel);

            if (!model && !updated) {
              updated = await requireRemoteObject(this, rel, observer, ...args);
              if (updated) {
                setTimeout(() => dataSource.save(updated.id, updated), 1000);
              }
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
