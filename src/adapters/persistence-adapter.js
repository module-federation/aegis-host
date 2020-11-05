'use strict'

export function save(service) {
  return async function ({ model }) {
    service.save(model);
  }
}

export function find(service) {
  return async function ({ model }) {
    service.find(model);
  }
}
