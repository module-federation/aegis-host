'use strict'

export function save(service) {
  return async function ({ model }) {
    return service.save(model);
  }
}

export function find(service) {
  return async function ({ model }) {
    return service.find(model);
  }
}
