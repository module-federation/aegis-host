import ModelFactory from ".";

function checkPayload(
  key,
  options = {},
  payload = {},
  port = checkPayload.name
) {
  const { model } = options;

  if (!model || Object.keys(payload) < 1 || !key) {
    throw new Error({
      desc: "model, payload, or key is missing",
      model,
      port,
      error,
      payload,
      key,
    });
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

  // find prop, already in model,
  if (model[key]) {
    return { [key]: model[key] };
  }

  // find prop in saved model
  return model
    .find()
    .then(latest => ({ [key]: latest[key] }))
    .catch(error => {
      throw new Error({
        desc: "property is missing" + key,
        port,
        error,
        payload,
        model,
      });
    });
}

/**
 * Default port handler called by adapter if no callback is specified.
 * Requires `port.keys` to be configured.
 * @param {*} options
 * @param {*} payload
 */
export default async function portHandler(options = {}, payload = {}) {
  const { model, port } = options;
  const spec = ModelFactory.getModelSpec(model);

  if (spec?.ports && spec.ports[port]) {
    const keys = spec.ports[port].keys;

    if (keys) {
      const changes = checkPayload(keys, options, payload, port);
      return model.update(changes);
    }
    console.warn("no keys or callback set for port", port);
  }
  console.warn("port configuration problem", model, port, spec);
}
