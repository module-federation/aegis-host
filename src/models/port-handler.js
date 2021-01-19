import ModelFactory from ".";

function makeObject(prop) {
  if (Array.isArray(prop)) {
    return prop.reduce((p, c) => ({ ...c, ...p }));
  }
  return prop;
}

async function checkProperty(
  key,
  options = {},
  payload = {},
  port = checkProperty.name
) {
  const { model } = options;

  if (!model || !payload || !key) {
    console.error({
      port,
      error: "model, payload, or key is missing",
      model,
      payload,
      key,
    });
    return;
  }

  if (Array.isArray(key)) {
    const keys = await Promise.all(
      key.map((k) => checkProperty(k, options, payload, port))
    );
    return keys;
  }

  if (payload[key]) {
    return { [key]: payload[key] };
  }

  if (model[key]) {
    return { [key]: model[key] };
  }

  const latest = await model.find();
  if (latest?.[key]) {
    return { [key]: latest[key] };
  }

  const error = "property is missing " + key;
  console.error({ port, error, payload, model, latest });
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
      const prop = await checkProperty(keys, options, payload, port);
      return model.update(makeObject(prop));
    }
  }
  console.warn("port configuration problem", model, port, spec);
}
