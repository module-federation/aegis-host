"use strict";

import async from "../lib/async-error";

export function save(service) {
  return async function ({ model }) {
    const result = await async(service.save(model));
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error);
  };
}

export function remove(service) {
  return async function ({ model }) {
    const result = await async(service.delete(model));
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error);
  };
}

export function find(service) {
  return async function ({ model }) {
    const result = await async(service.find(model));
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error);
  };
}

export function update(service) {
  return async function ({ model, args: [changes] }) {
    const result = await async(service.update(model, changes));
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error);
  };
}

export function close(service) {
  return function () {
    try {
      service.close();
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
}
