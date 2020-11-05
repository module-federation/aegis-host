'use strict'

export function save(service) {
  return async function ({ model }) {
    service.save(model);
  }
}

