"use strict";

const domainEvents = {
  cacheLookupRequest: modelName => `cacheLookupRequest_${modelName}`,
  cacheLookupResults: modelName => `cacheLookupResponse_${modelName}`,
  remoteObjectInquiry: modelName => `remoteObjectInquiry_${modelName}`,
  remoteObjectLocated: modelName => `remoteObjectLocated_${modelName}`,
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