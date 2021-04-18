"use strict";

const domainEvents = {
  portTimeout: model => `portTimeout_${model.getName()}`,
  portRetryFailed: model => `portRetryFailed_${model.getName()}`,
  portRetryWorked: model => `portRetryWorked_${model.getName()}`,
  undoStarted: model => `undoStart_${model.getName()}`,
  undoFailed: model => `undoFailed_${model.getName()}`,
  undoWorked: model => `undoWorked_${model.getName()}`,
  unauthorizedCommand: model => `unauthorizedCommand_${model.getName()}`,
  addModel: eventName => `addModel_${eventName}`,
  editModel: eventName => `editModel_${eventName}`,
};

export default domainEvents;
