"use strict";

function checkPayload(
  key,
  options = {},
  payload = {},
  port = checkPayload.name
) {
  const { model } = options;

  if (!model || Object.keys(payload) < 1 || !key) {
    console.error({
      desc: "model, payload or key is missing or invalid",
      model,
      port,
      error,
      payload,
      key,
    });

    return;
  }

  // Call recursively if array
  if (Array.isArray(key)) {
    const keys = key.map(k => checkPayload(k, options, payload, port));
    return keys.reduce((p, c) => ({ ...p, ...c }));
  }

  // find prop in payload
  if (payload[key]) {
    return { [key]: payload[key] };
  }

  // find prop already in model,
  if (model[key]) {
    return { [key]: model[key] };
  }

  // find prop in saved model
  return model
    .find()
    .then(latest =>
      latest[key] ? { [key]: latest[key] } : { [key]: "not found" }
    )
    .catch(error => {
      console.error({
        desc: error + key,
        port,
        error,
        payload,
        model,
      });
    });
}

/**
 * Default callback used by adapters if no callback is specified for the port.
 * Requires `[port].keys` to be configured in `ModelSpecification.ports[port]`
 * to determine if payload contains expected data. Either way, any properties
 * of the payload object are saved to the model.
 *
 * @param {{model:import(".").Model,port:import(".").ports[""]}} options
 * @param {*} payload
 */
export default async function portHandler(options = {}, payload = {}) {
  const { model, port } = options;
  const spec = model.getSpec();

  if (spec?.ports && spec.ports[port]) {
    const keys = spec.ports[port].keys;

    if (keys) {
      const expectedPayload = checkPayload(keys, options, payload, port);
      return model.update(expectedPayload);
    }
    console.warn("no keys or callback set for port", port);
  }
  console.warn("port configuration problem", model.getName(), port, spec);

  // degrade gracefully
  return model.update(payload);
}
