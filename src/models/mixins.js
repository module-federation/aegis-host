'use strict'
/**
 * @callback mixinFunction
 * @param {Object} o Object to compose
 * @returns {Object} Composed object
 */

/**
 * @callback functionalMixin
 * @param {*} mixinParams params for mixin function 
 * @returns {mixinFunction}
 */


import uuid from "../lib/uuid";

/**
 * @type {functionalMixin}
 * @param {Function} fnCreateId function that returns unique id
 */
export const withId = (fnCreateId) => o => ({
  ...o,
  id: fnCreateId()
});

/**
 * @type {functionalMixin}
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

// export const withImmutableProps = (
//   ...properties
// ) => {
//   return (o) => ({
//     ...o,

//   });
// };


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

export const utc = () => new Date().toUTCString();








