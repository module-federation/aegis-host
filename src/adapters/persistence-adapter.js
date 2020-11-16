'use strict'

export function save(service) {
  return async function ({ model, resolve }) {
    service.save(model).then(model => resolve(model));
  }
}

export function find(service) {
  return async function ({ model, resolve }) {
    service.find(model).then(model => resolve(model));
  }
}
