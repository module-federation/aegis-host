"use strict";

/**
 * @callback mixinFunction
 * @param {Object} o - Object to compose
 * @returns {Object} - Composed object
 */

/**
 * @callback functionalMixinFactory
 * @param {*} mixinFunctionParams params for mixin function
 * @returns {mixinFunction}
 */

/**
 *
 */
export const utc = () => new Date().toUTCString();

/**
 * Add a unique identifier
 * @param {Function} fnCreateId function that returns unique id
 */
export const withId = (propName, fnCreateId) => {
  return (o) => ({ ...o, [propName]: fnCreateId() });
};

/**
 * Add a timestamp
 * @param {string} propName name of property to add
 * @param {Function} [fnTimestamp] default is UTC
 */
export const withTimestamp = (propName, fnTimestamp = utc) => {
  return (o) => ({ [propName]: fnTimestamp(), ...o });
};

/**
 * Convert keys from symbols to strings when
 * the object is serialized so the properties
 * can be seen in JSON output. When `deserialize`
 * is true, convert them back to symbols.
 * @param {{key: string, value: Symbol}} keyMap
 */
export const withSymbolsInJSON = (keyMap, deserialize = false) => (o) => {
  function fromJSON() {
    if (deserialize) {
      return Object.keys(keyMap)
        .map((k) => (o[k] ? { [keyMap[k]]: o[k] } : {}))
        .reduce((p, c) => ({ ...c, ...p }));
    }
    return {};
  }

  console.log(fromJSON());

  return {
    ...o,
    toJSON() {
      const symbols = Object.keys(keyMap)
        .map((k) => ({ [k]: this[keyMap[k]] }))
        .reduce((p, c) => ({ ...c, ...p }));
      return {
        ...this,
        ...symbols,
      };
    },
    ...fromJSON(),
  };
};
