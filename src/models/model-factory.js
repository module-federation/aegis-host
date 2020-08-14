import uuid from '../lib/uuid';
import compose from '../lib/compose';

let modelFactories;
let eventFactories;

/**
 * @typedef {Object} Model
 * @property {Function} getId
 * @property {function} getModelName
 */

/**
 * @typedef {Object} Event
 * @property {Function} getId
 * @property {Function} getEventName
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
  throw new Error('eventlType missing or invalid');
}

export function createEventName(eventType, modelName) {
  return checkEventType(eventType) + checkModelName(modelName);
}

function addId(o) {
  const _id = o.generateId();
  return Object.assign({}, o, {
    id: _id,
    getId: () => _id
  });
}

function addEventName(o) {
  const { eventType, modelName } = o;
  const _eventName = createEventName(eventType, modelName);
  return Object.assign({}, o, {
    eventName: _eventName,
    getEventName: () => _eventName,
  });
}

function addModelName(o) {
  const { modelName } = o;
  return Object.assign({}, o, {
    modelName: modelName,
    getModelName: () => modelName
  });
}

const enrichModel = compose(
  addId,
  addModelName
);

const enrichEvent = compose(
  addId,
  addEventName
);

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

  listModels() {
    return [...modelFactories.values()];
  }

  /**
   * Call the factory function previously registered for `modelName`
   * @see {@link registerModel} for further info 
   * @param {String} modelName 
   * @param {*} args
   * @returns {Promise<Model>} the model instance
   */
  async createModel(modelName, args) {
    modelName = checkModelName(modelName);

    if (modelFactories.has(modelName)) {
      const model = await modelFactories.get(modelName)(args);
      const params = {
        generateId: uuid,
        modelName: modelName
      };
      return Object.freeze(enrichModel({ ...model, ...params }));
    }
    throw new Error('unregistered model');
  }

  /**
   * Call factory function previously registered for `eventType`
   * @see {@link registerEvent}
   * @param {String} eventType 
   * @param {String} modelName 
   * @param {*} args 
   * @returns {Promise<Event>} the event instance
   */
  async createEvent(eventType, modelName, args) {
    modelName = checkModelName(modelName);
    eventType = checkEventType(eventType);

    if (eventFactories[eventType].has(modelName)) {
      const event = await eventFactories[eventType].get(modelName)(args);
      const params = {
        generateId: uuid,
        eventType: eventType,
        modelName: modelName
      }
      return Object.freeze(enrichEvent({ ...event, ...params }));
      // const standardizedEvent = standardizeEvent(eventType, modelName, uuid)(event);
      // return Object.freeze(standardizedEvent);
    }
    throw new Error('unregistered model event');
  }
}