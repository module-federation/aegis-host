"use strict";

// import ModelFactory from "./model-factory";
// const CREATE = ModelFactory.EventTypes.CREATE;
// const UPDATE = ModelFactory.EventTypes.UPDATE;
// const DELETE = ModelFactory.EventTypes.DELETE;
const cacheHit = modelName => `remoteObjectCacheHit_${modelName}`;

const domainEvents = {
  consumeRemoteCacheEvents: "consumeRemoteCacheEvents",
  remoteObjectCacheHit: modelName => cacheHit(modelName),
  portTimeout: (model, port) => `portTimeout_${port}_${model.getName()}`,
  portRetryFailed: (model, port) =>
    `portRetryFailed_${port}_${model.getName()}`,
  portRetryWorked: (model, port) =>
    `portRetryWorked_${port}_${model.getName()}`,
  undoStarted: model => `undoStart_${model.getName()}`,
  undoFailed: model => `undoFailed_${model.getName()}`,
  undoWorked: model => `undoWorked_${model.getName()}`,
  unauthorizedCommand: model => `unauthorizedCommand_${model.getName()}`,
  addModel: eventName => `addModel_${eventName}`,
  editModel: eventName => `editModel_${eventName}`,
};

export default domainEvents;
