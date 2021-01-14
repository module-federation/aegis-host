"use strict";

export default function async(promise) {
  return promise
    .then((data) => ({ ok: true, data }))
    .catch((error) => Promise.resolve({ ok: false, error }));
}
