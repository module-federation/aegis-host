"use strict";

export default function listConfigsFactory({ models } = {}) {
  return async function listConfigs() {
    return models.getModelSpecs().filter(spec => !spec.isCached);
  };
}
