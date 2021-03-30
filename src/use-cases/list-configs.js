"use strict";

export default function listConfigsFactory({ models } = {}) {
  return async function listConfigs() {
    return models.getRemoteModels();
  };
}
