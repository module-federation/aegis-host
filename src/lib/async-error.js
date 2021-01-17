"use strict";

/**
 * async wrapper - catch and log errors,
 * return predictable response
 * @param {Promise} promise
 */
export default function async(promise) {
  return promise
    .then((data) => ({ ok: true, data }))
    .catch((error) => {
      console.error(error);
      return Promise.resolve({ ok: false, error });
    });
}
