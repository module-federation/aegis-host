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

export const utc = () => new Date().toUTCString();

/**
 * @param {Function} fnCreateId function that returns unique id
 */
export const withId = (propName, fnCreateId) => o => ({
  ...o,
  [propName]: fnCreateId()
});

/**
 * @param {string} [propName]
 * @param {Function} [fnTimestamp]
 */
export const withTimestamp = (
  propName = 'timestamp',
  fnTimestamp = utc
) => {
  return (o) => ({
    ...o,
    [propName]: fnTimestamp()
  });
};

/*
 * @param  {...string} propNames 
 */
// export const withImmutableProperties = (...propNames) => (o) => {
//   const preventUpdates = (changes) => {
//     const readonly = Object.keys(changes)
//       .filter(key => propNames.includes(key));

//     if (readonly?.length > 0) {
//       throw new Error(`cannot update readonly properties: ${readonly}`);
//     }
//   }

//   return {
//     ...o,
//     [Symbol.for('preventUpdates')]: preventUpdates
//   }
// }

/**
 * 
 * @param {{key: string, value: Symbol}} keyMap 
 */
export const withSymbolsInJSON = (keyMap) => (o) => {
  function toJSON() {
    const symbols = Object.keys(keyMap)
      .map(k => ({ [k]: o[keyMap[k]] }))
      .reduce((p, c) => ({ ...c, ...p }))

    return {
      ...o,
      ...symbols
    }
  }

  return {
    ...o,
    toJSON
  }
}

export const withPropertyTimestamp = (
  prop,
  fnProp = (p) => p.toLowerCase() + 'Time',
  fnTimestamp = utc
) => o => {
  const propName = fnProp(
    ((o.hasOwnProperty(prop)) ? o[prop] : 'event')
  );
  return {
    [propName]: fnTimestamp(),
    ...o
  }
}








