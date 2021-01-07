"use strict";

export default function async(promise, throwException = false) {
  return promise
    .then(data => ({ ok: true, data }))
    .catch(error =>
      Promise.resolve({ ok: false, error, log: () => console.log(error) })
    )
    .then((result) => {
        if (!result.ok && throwException) {
            throw new Error(result.error);
        }
    });
}
