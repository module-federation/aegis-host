"use strict";

import ModelFactory from "./index";
import domainEvents from "./domain-events";

const relationType = {
  /**
   * @todo implement cache miss for distributed cache
   *
   * @param {import("../models/model-factory").Model} model
   * @param {import("../datasources/datasource").default} ds
   * @param {import("./index").relations[relation]} rel
   */
  oneToMany: async (model, ds, rel) => {
    const pk = model.id || model.getId();
    return ds.list({ [rel.foreignKey]: pk });
  },
  /**
   *
   * @param {import("../models").Model} model
   * @param {import("../datasources/datasource").default} ds
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

function isLocalObject(modelName) {
  if (!ModelFactory.getModelSpec(modelName)) {
    console.warn("non-local or invalid model", modelName);
    return false;
  }
  return true;
}

/**
 * If the model is hosted elsewhere, on a remote host instance, sign up
 * for distributed cache events and try to stream its code. The caller
 * waits until the code has been imported or the operation times out.
 * Its a no-op if the object is local.
 *
 * @param {import(".").relations[x]} relation
 * @param {import("./observer").Observer} observer
 * @returns
 */
function requireRemoteObject(relation, observer) {
  const cacheEvt = domainEvents.consumeRemoteCacheEvents;
  const cacheHit = domainEvents.remoteObjectCacheHit(relation.modelName);
  const callback = fn => () => fn();

  const promise = new Promise(function (resolve) {
    setTimeout(resolve, 10000);
    return observer.on(cacheHit, callback(resolve));
  });

  observer.notify(cacheEvt, {
    eventName: cacheEvt,
    modelName: relation.modelName,
    relation,
  });

  return promise;
}

function handleRemoteObject(relation, observer) {
  if (!isLocalObject(relation.modelName))
    return requireRemoteObject(relation, observer);

  return Promise.resolve();
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
            const self = this;
            // if the object is remote, wait until it has been loaded.
            // If the model is hosted elsewhere, on a remote host instance,
            // broadcast the query to other instances and wait for a response.
            // handleRemoteObject(rel, observer).then(function () {
            const ds = dataSource.getFactory().getDataSource(rel.modelName);
            return relationType[rel.type](self, ds, rel);
            // });
          },
        };
      } catch (e) {
        console.log(e);
      }
    })
    .reduce((c, p) => ({ ...p, ...c }));
}
