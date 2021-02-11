"use strict";

import Model from "./model";

const domainEvents = {
  portTimeout: model => `portTimeout:${Model.getName(model)}`,
  portRetryWorked: model => `portRetryWorked:${Model.getName(model)}`,
  undoStarted: model => `undoStart:${Model.getName(model)}`,
  undoFailed: model => `undoFailed:${Model.getName(model)}`,
  undoWorked: model => `undoWorked:${Model.getName(model)}`,
  unauthorizedCommand: model => `unauthorizedCommand:${Model.getName(model)}`,
  addModel: eventName => `addModel:${eventName}`,
  editModel: eventName => `editModel:${eventName}`,
};

export default domainEvents;
