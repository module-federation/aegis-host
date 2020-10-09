'use strict'

import Model from './model';
import Event from './event';

/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE'} EventType 
 */

/**
 * @typedef {{
 *  id:string,
 *  createTime:string,
 *  modelName:string,
 *  onUpdate:function(Model,*):Model,
 *  onDelete:function(Model):Model
 * }} Model
 */

/**
 * @typedef {{ 
 *  modelName: string,
 *  endpoint: string,
 *  factory: function(*): any,
 *  onUpdate?: function(Model,*): Model,
 *  onDelete?: function(Model): Model,
 *  eventHandlers?: Array<function({
 *    eventName:string, 
 *    eventData:any[]
 *  }):Promise<void>>
 *  mixins?: Array<import('./mixins').mixinFunction>,
 *  isRemote?: boolean
 * }} options
 */

/**
 * @readonly
 * @enum {EventType}
 */
const EventTypes = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * @param {String} modelName
 */
function checkModelName(modelName) {
  if (typeof modelName === 'string') {
    return modelName.toUpperCase();
  }
  throw new Error('modelName missing or invalid');
}

/**
 *
 * @param {EventType} eventType
 */
function checkEventType(eventType) {
  if (typeof eventType === 'string') {
    eventType = eventType.toUpperCase();
    if (Object.values(EventTypes).includes(eventType)) {
      return eventType;
    }
  }
  throw new Error('eventType missing or invalid');
}

/**
 *
 * @param {EventType} eventType
 * @param {String} modelName
 */
function createEventName(eventType, modelName) {
  return checkEventType(eventType) + checkModelName(modelName);
}

const modelFactories = new Map();
const eventFactories = {
  [EventTypes.CREATE]: new Map(),
  [EventTypes.UPDATE]: new Map(),
  [EventTypes.DELETE]: new Map()
};

/**
 * Register and create models.
 */
const ModelFactory = {
  /**
   * Register a factory function to create the model `modelName`
   * @param {options} options
   */
  registerModel: ({
    modelName,
    endpoint,
    factory,
    onUpdate,
    onDelete,
    eventHandlers = [],
    isRemote = false,
    mixins = []
  }) => {
    modelName = checkModelName(modelName);

    if (!modelFactories.has(modelName)
      && typeof factory === 'function'
    ) {
      modelFactories.set(modelName, {
        factory,
        onUpdate,
        onDelete,
        eventHandlers,
        isRemote,
        mixins,
        endpoint
      });
    }
  },

  /**
   * Register a factory function to create an event for the model `modelName`
   * @param {EventType} eventType type of event
   * @param {String} modelName model the event is about
   * @param {Function} factory factory function
   */
  registerEvent: (eventType, modelName, factory) => {
    modelName = checkModelName(modelName);
    eventType = checkEventType(eventType);

    if (typeof factory === 'function') {
      eventFactories[eventType].set(modelName, factory);
    }
  },

  /**
   * Call the factory function previously registered for `modelName`
   * @param {String} modelName - model's name
   * @param {*} args - input sent in the request
   * @returns {Promise<Readonly<Model>>} the model instance
   */
  createModel: async (modelName, args) => {
    modelName = checkModelName(modelName);

    if (modelFactories.has(modelName)) {
      return Model.create({
        modelName,
        onUpdate: modelFactories.get(modelName).onUpdate,
        onDelete: modelFactories.get(modelName).onDelete,
        factory: modelFactories.get(modelName).factory,
        mixins: modelFactories.get(modelName).mixins,
        args
      });
    }
    throw new Error('unregistered model');
  },

  /**
   * Call factory function previously registered for `eventType` and `model`
   * @param {EventType} eventType
   * @param {String} modelName
   * @param {*} args
   * @returns {Promise<Readonly<Event>>} the event instance
   */
  createEvent: async (eventType, modelName, args) => {
    modelName = checkModelName(modelName);
    eventType = checkEventType(eventType);

    if (eventFactories[eventType].has(modelName)) {
      return Event.create({
        eventType,
        modelName,
        factory: eventFactories[eventType].get(modelName),
        args
      });
    }
    throw new Error('unregistered model event');
  },

  /**
   * Get models imported from remote server
   */
  getRemoteModels: () => {
    let models = [];
    for (let [k, v] of modelFactories) {
      if (v.isRemote) {
        models.push({
          modelName: k,
          ...v
        });
      }
    }
    return models;
  },

  /**
   *
   * @param {Model} model - original model
   * @param {*} changes - object with updated properties
   * @returns {Model} updated model
   */
  updateModel: (model, changes) => {
    return Model.update(model, changes);
  },

  deleteModel: (model) => {
    return Model.delete(model);
  },

  /**
   * Get ID of model
   * @param {Model} model
   */
  getModelId: (model) => {
    return Model.getId(model);
  },

  /**
   * Get model's name
   */
  getModelName: (model) => {
    return Model.getName(model);
  },

  /**
   * Get `eventName` value 
   */
  getEventName: createEventName,

  EventTypes
}

Object.freeze(modelFactories);
Object.freeze(eventFactories);
Object.freeze(ModelFactory);

export default ModelFactory;


