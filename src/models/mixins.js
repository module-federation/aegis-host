'use strict'

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
  return (o) => ({ ...o, [propName]: fnCreateId() })
}

/**
 * Add a timestamp
 * @param {string} propName name of property to add
 * @param {Function} [fnTimestamp] default is UTC
 */
export const withTimestamp = (propName, fnTimestamp = utc) => {
  return (o) => ({ ...o, [propName]: fnTimestamp() })
}


/**
 * Convert keys from symbols to strings when 
 * the object is serialized so the properties
 * can be seen in JSON output   
 * @param {{key: string, value: Symbol}} keyMap 
 */
export const withSymbolsInJSON = (keyMap) => (o) => {
  function toJSON() {
    const symbols = Object.keys(keyMap)
      .map(k => ({ [k]: this[keyMap[k]] }))
      .reduce((p, c) => ({ ...c, ...p }))
    return {
      ...this,
      ...symbols
    }
  }
  return {
    ...o,
    toJSON
  }
}








