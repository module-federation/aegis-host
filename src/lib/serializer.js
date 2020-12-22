'use strict';

const objectTypeMap = {
  test: (key, value) => value instanceof Map,
  serialize: (key, value) => [...value],
};

const objectTypes = [objectTypeMap];

function serializeObject(key, value) {
  const type = objectTypes.find((type) => type.test(key, value));
  if (type) {
    return type.serialize(key, value);
  }
  return value;
}

const replaceTypes = {
  //function: (key, value) => value.toString(),
  object: (key, value) => serializeObject(key, value),
};

export function serialize(key, value) {
  //console.log({ func: serialize.name, key, typeof: typeof value, value });
  const replace = replaceTypes[typeof value];
  if (replace) {
    return replace(key, value);
  }
  return value;
}

export function deserialize(key, value) {
  //console.log({ func: deserialize.name, key, value, value: typeof value });
  if (typeof key === 'string' && key.indexOf('function ') === 0) {
    return eval(`(${value})`);
  }
  if (typeof key === 'object' && key.indexof('Map') === 0) {
    return new Map(value);
  }
  return value;
}
