"use strict";

import async from "../lib/async-error";
import checkAcl from "../lib/check-acl";

function portAuthorized(spec, port, permission) {
  return (
    port && spec.ports && spec.ports[port] && checkAcl("write", permission)
  );
}
/**
 *
 * @param {import("../models/model-factory").ModelFactory} models
 * @param {import("../models/model").Model} model
 * @param {{port:string}} query
 */
export default async function invokePort(model, port, permission) {
  const spec = model.getSpec();

  if (portAuthorized(spec, port, permission)) {
    const callback = spec.ports[port].callback;

    if (callback) {
      const result = await async(model[port](callback));
      if (result.ok) {
        return { ...model, ...result.data };
      }
    }

    const result = await async(model[port]());
    if (result.ok) {
      return { ...model, ...result.data };
    }
  }
  return model;
}
