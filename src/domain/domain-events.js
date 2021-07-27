"use strict";

const domainEvents = {
  internalCacheRequest: modelName => `internalCacheRequest_${modelName}`,
  externalCacheRequest: modelName => `externalCacheRequest_${modelName}`,
  internalCacheResponse: modelName => `internalCacheResponse_${modelName}`,
  externalCacheResponse: modelName => `externalCacheResponse_${modelName}`,
  portTimeout: (model, port) => `portTimeout_${port}_${model.getName()}`,
  portRetryFailed: (model, port) =>
    `portRetryFailed_${port}_${model.getName()}`,
  portRetryWorked: (model, port) =>
    `portRetryWorked_${port}_${model.getName()}`,
  undoStarted: model => `undoStart_${model.getName()}`,
  undoFailed: model => `undoFailed_${model.getName()}`,
  undoWorked: model => `undoWorked_${model.getName()}`,
  unauthorizedCommand: model => `unauthorizedCommand_${model.getName()}`,
  addModel: modelName => `addModel_${modelName}`,
  editModel: modelName => `editModel_${modelName}`,
};

export default domainEvents;
