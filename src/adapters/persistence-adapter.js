"use strict";

export function save(service) {
  return async function ({ model }) {
    try {
      const saved = await service.save(model);
      return saved;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
}

export function find(service) {
  return async function ({ model }) {
    try {
      const updated = await service.find(model);
      return updated;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
}

export function update(service) {
  return async function ({ model, args: [changes] }) {
    try {
      const update = await service.update(model, changes);
      return update;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
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
