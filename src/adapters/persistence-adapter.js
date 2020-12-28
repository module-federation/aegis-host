"use strict";

import e from "express";
import Model from "../models/model";

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

export function update(service) {
  return async function ({ model, args: [changes] }) {
    try {
      return await service.update(model, changes);
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
