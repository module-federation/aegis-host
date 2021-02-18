"use strict";

import ModelFactory from ".";

const domainEvents = {
  portTimeout: model => `portTimeout:${model.getName()}`,
  portRetryWorked: model => `portRetryWorked:${model.getName()}`,
  undoStarted: model => `undoStart:${model.getName()}`,
  undoFailed: model => `undoFailed:${model.getName()}`,
  undoWorked: model => `undoWorked:${model.getName()}`,
  unauthorizedCommand: model => `unauthorizedCommand:${model.getName()}`,
  addModel(eventName) {
    return `${this.addModel.name}:${eventName}`;
  },
  editModel(eventName) {
    return `${this.editModel.name}:${eventName}`;
  },
};

export default domainEvents;
