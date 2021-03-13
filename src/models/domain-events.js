"use strict";

const domainEvents = {
  portTimeout: model => `portTimeout:${model.getName()}`,
  portRetryWorked: model => `portRetryWorked:${model.getName()}`,
  undoStarted: model => `undoStart:${model.getName()}`,
  undoFailed: model => `undoFailed:${model.getName()}`,
  undoWorked: model => `undoWorked:${model.getName()}`,
  unauthorizedCommand: model => `unauthorizedCommand:${model.getName()}`,
  addModel: eventName => `addModel:${eventName}`,
  editModel: eventName => `editModel:${eventName}`,
};

export default domainEvents;
