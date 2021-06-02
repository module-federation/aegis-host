"use strict";

import Model from "./model";
import Event from "./event";

/** @typedef {'CREATE' | 'UPDATE' | 'DELETE'} EventType */
/** @typedef {import('./index').ModelSpecification} ModelSpecification */
/** @typedef {import('./observer').Observer} Observer */
/** @typedef {import('../datasources/datasource').default} Datasource */

/**
 * @typedef {Object} ModelFactory
 * @property {function(Observer,Datasource,string,...args):Promise<Readonly<Model>>} createModel
 * @property {function(string,string,*):Promise<Readonly<Event>>} createEvent
 * @property {function(Model,object):Model} updateModel
 * @property {function(Model):Model} deleteModel
 * @property {function(string,string):string} getEventName
 * @property {{CREATE:string,UPDATE:string,DELETE:string}} EventTypes
 * @property {function(any):string} getModelId
 * @property {function(Model):string[]} getPortFlow
 * @property {function(Model,string):Model} loadModel
 * @property {function():ModelSpecification[]} getRemoteModels
 * @property {function(Model|string):ModelSpecification} getModelSpec
 */

/**
 * @readonly
 * @enum {EventType}
 */
const EventTypes = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

/**
 * @param {String} modelName
 */
function checkModelName(modelName) {
  if (typeof modelName === "string") {
    return modelName.toUpperCase();
  }
  throw new Error("modelName missing or invalid");
}

/**
 *
 * @param {EventType} eventType
 */
function checkEventType(eventType) {
  if (typeof eventType === "string") {
    const upper = eventType.toUpperCase();
    if (Object.values(EventTypes).includes(upper)) {
      return upper;
    }
  }
  throw new Error("eventType missing or invalid");
}

/**
 *
 * @param {EventType} eventType
 * @param {String} modelName
 */
function createEventName(eventType, modelName) {
  return checkEventType(eventType) + checkModelName(modelName);
}

/**
 * @todo handle all state same way
 * @type {Map<string,ModelSpecification>}
 */
const modelFactories = new Map();

/**
 * @type {{[x: string]: Map<string,function(string,EventType,function()):Event>}}
 */
const eventFactories = {
  [EventTypes.CREATE]: new Map(),
  [EventTypes.UPDATE]: new Map(),
  [EventTypes.DELETE]: new Map(),
};

/**
 * Register model types and create model instances.
 * @type {ModelFactory}
 */
const ModelFactory = {
  /**
   * Register a factory function to create the model `modelName`
   * @param {ModelSpecification} model
   */
  registerModel: model => {
    const name = checkModelName(model.modelName);
    if (!modelFactories.has(name)) {
      modelFactories.set(name, model);
    } else {
      console.log("deleting and readding model spec", name);
      modelFactories.delete(name);
      modelFactories.set(name, model);
    }
  },

  /**
   * Register a factory function to create an event for the model `modelName`
   * @param {EventType} eventType type of event
   * @param {String} modelName model the event is about
   * @param {Function} factory factory function
   */
  registerEvent: (eventType, modelName, factory) => {
    const name = checkModelName(modelName);
    const type = checkEventType(eventType);

    if (typeof factory === "function") {
      eventFactories[type].set(name, factory);
    }
  },

  /**
   * Call the factory function previously registered for `modelName`
   * @param {String} modelName - model's name
   * @param {*[]} args - input sent in the request
   * @param {import('./observer').Observer} observer - send & receive events
   * @param {import('../datasources/datasource').default} datasource - persistence/cache
   * @returns {Promise<Readonly<Model>>} the model instance
   */
  createModel: async function (observer, datasource, modelName, ...args) {
    const name = checkModelName(modelName);
    const spec = modelFactories.get(name);

    if (spec) {
      return Model.create({
        args,
        spec: {
          ...spec,
          observer,
          datasource,
        },
      });
    }
    throw new Error("unregistered model");
  },

  /**
   * Unmarshalls a deserialized model.
   * @param {import(".").Model} model
   * @param {*} modelName
   */
  loadModel: (observer, datasource, model, modelName) => {
    const name = checkModelName(modelName);
    const spec = modelFactories.get(name);

    if (spec) {
      return Model.load({
        model,
        spec: {
          ...spec,
          observer,
          datasource,
        },
      });
    }
    throw new Error("unregistered model");
  },

  /**
   * Call factory function previously registered for `eventType` and `model`
   * @param {EventType} eventType
   * @param {String} modelName
   * @param {*} args
   * @returns {Promise<Readonly<Event>>} the event instance
   */
  createEvent: async (eventType, modelName, args) => {
    const name = checkModelName(modelName);
    const type = checkEventType(eventType);
    const factory = eventFactories[type].get(name);

    if (factory) {
      return Event.create({
        args,
        factory,
        eventType: type,
        modelName: name,
      });
    }
    throw new Error("unregistered model event");
  },

  /**
   * Get federated models imported from remote server
   */
  getRemoteModels: () => [...modelFactories.values()],

  getModelSpecs: () => [...modelFactories.values()],

  /**
   * Get the model's specification
   * @param {Model|string} model
   */
  getModelSpec: model => {
    if (!model) return;
    const name = typeof model === "object" ? Model.getName(model) : model;
    return modelFactories.get(checkModelName(name));
  },

  /**
   *
   * @param {Model} model - original model
   * @param {*} changes - object with updated properties
   * @returns {Model} updated model
   */
  updateModel: (model, changes) => Model.update(model, changes),

  /**
   *
   * @param {Model} model
   */
  deleteModel: model => Model.delete(model),

  clearModels: () => modelFactories.clear(),

  /**
   * Get ID of model
   * @param {Model} model
   */
  getModelId: model => Model.getId(model),

  /**
   * Get model's name
   */
  getModelName: model => Model.getName(model),

  /**
   * Get `eventName` value
   */
  getEventName: createEventName,

  EventTypes,
};

Object.freeze(modelFactories);
Object.freeze(eventFactories);
Object.freeze(ModelFactory);
Object.freeze(EventTypes);

export default ModelFactory;
