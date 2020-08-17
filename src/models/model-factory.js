import Model from './model';
import Event from './event';

let modelFactories;
let eventFactories;

/**
 * @typedef {import('./model').Model} Model
 * @typedef {import('./event').Event} Event
 */

/**
 * @typedef {Object} EventTypes
 * @property {String} CREATE
 * @property {String} UPDATE
 * @property {String} DELETE
 */
export const EventTypes = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
}

function checkModelName(modelName) {
  if (typeof modelName === 'string') {
    return modelName.toUpperCase();
  }
  throw new Error('modelName missing or invalid');
}

function checkEventType(eventType) {
  if (typeof eventType === 'string') {
    eventType = eventType.toUpperCase();
    if (Object.keys(EventTypes).includes(eventType)) {
      return eventType;
    }
  }
  throw new Error('eventType missing or invalid');
}

export function createEventName(eventType, modelName) {
  return checkEventType(eventType) + checkModelName(modelName);
}

export default class ModelFactoryInstance {
  constructor() {
    modelFactories = new Map();
    eventFactories = {
      [EventTypes.CREATE]: new Map(),
      [EventTypes.UPDATE]: new Map(),
      [EventTypes.DELETE]: new Map()
    }
  }

  /**
   * Register a factory function to create the model `modelName`
   * @param {String} modelName 
   * @param {Function} factoryFunction 
   */
  registerModel(modelName, factoryFunction) {
    modelName = checkModelName(modelName);

    if (!modelFactories.has(modelName)
      && typeof factoryFunction === 'function') {
      modelFactories.set(modelName, factoryFunction);
    }
  }

  /**
   * Register a factory function to create an event for the model `modelName`
   * @param {String} eventType Name of event {@link EventTypes}
   * @param {String} modelName
   * @param {Function} factoryFunction
   */
  registerEvent(eventType, modelName, factoryFunction) {
    modelName = checkModelName(modelName);
    eventType = checkEventType(eventType);

    if (typeof factoryFunction === 'function') {
      eventFactories[eventType].set(modelName, factoryFunction);
    }
  }

  /**
   * Call the factory function previously registered for `modelName`
   * @param {String} modelName 
   * @param {*} args
   * @returns {Promise<Model>} the model instance
   */
  async createModel(modelName, args) {
    modelName = checkModelName(modelName);

    if (modelFactories.has(modelName)) {
      const model = await Model.create({
        factory: modelFactories.get(modelName),
        args: args,
        modelName: modelName
      });

      return Object.freeze(model);
    }
    throw new Error('unregistered model');
  }

  /**
   * Call factory function previously registered for `eventType` and `model`
   * @param {String} eventType 
   * @param {String} modelName 
   * @param {*} args 
   * @returns {Promise<Event>} the event instance
   */
  async createEvent(eventType, modelName, args) {
    modelName = checkModelName(modelName);
    eventType = checkEventType(eventType);

    if (eventFactories[eventType].has(modelName)) {
      const event = await Event.create({
        factory: eventFactories[eventType].get(modelName),
        args: args,
        eventType: eventType,
        modelName: modelName
      });

      return Object.freeze(event);
    }
    throw new Error('unregistered model event');
  }

  listModels() {
    return [...modelFactories.values()];
  }
}