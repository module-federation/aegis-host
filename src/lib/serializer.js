'use strict';

const objectTypes = {
  Map: (key, value) => [...value],
};

function serializeObject(key, value) {
  const objType = {}.toString.call(value);
  console.log({ func: serializeObject.name, key, objType });
  if (objectTypes[objType]) {
    console.log({ func: serializeObject.name, desc: 'execute' });
    return objectTypes[objType](key, value);
  }
  return value;
}

const replaceTypes = {
  function: (key, value) => value.toString(),
  object: (key, value) => serializeObject(key, value),
};

export function serialize(key, value) {
  console.log({ func: serialize.name, key, value, typeof: typeof value });
  if (replaceTypes[typeof value]) {
    const replaceValue = replaceTypes[typeof value](key, value);
    console.log('replaceValue', replaceValue);
    return replaceValue;
  }
  return value;
}

export function deserialize(key, value) {
  console.log({ func: deserialize.name, key, value });
  if (typeof key === 'string' && key.indexOf('function ') === 0) {
    return eval(`(${value})`);
  }
  return value;
}
