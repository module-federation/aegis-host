"use strict";

import Model from "./model";

const domainEvents = {
  portTimeout: (model) => `portTimeout:${Model.getName(model)}`,
  portRetryWorked: (model) => `portRetryWorked:${Model.getName(model)}`,
  undoStart: (model) => `undoStart:${Model.getName(model)}`,
  undoFailed: (model) => `undoFailed:${Model.getName(model)}`,
  undoWorked: (model) => `undoWorked:${Model.getName(model)}`,
};

export default domainEvents;
