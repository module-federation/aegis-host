"use strict";

export function save(service) {
  return async function ({ model }) {
    try {
      return await service.save(model);
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
