let modelFactories;
let eventFactories;

function checkModelName(modelName) {
  if (typeof modelName === 'string') {
    return modelName.toUpperCase();
  }
  throw new Error('modelName missing or invalid');
}

function checkEventName(eventName) {
  if (typeof eventName === 'string') {
    eventName = eventName.toUpperCase();
    if (Object.keys(Events).includes(eventName)) {
      return eventName;
    }
  }
  throw new Error('eventlName missing or invalid');
}

/**
 * @typedef {Object} Events
 * @property {String} CREATE
 * @property {String} UPDATE
 */
export const Events = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE'
}

export default class ModelFactoryInstance {
  constructor() {
    modelFactories = new Map();
    eventFactories = {
      [Events.CREATE]: new Map(),
      [Events.UPDATE]: new Map()
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
   * @param {String} eventName Name of event {@link Events}
   * @param {String} modelName
   * @param {Function} factoryFunction
   */
  registerEvent(eventName, modelName, factoryFunction) {
    modelName = checkModelName(modelName);
    eventName = checkEventName(eventName);
    if (typeof factoryFunction === 'function') {
      eventFactories[eventName].set(modelName, factoryFunction);
    }
  }

  listModels() {
    return [...modelFactories.values()];
  }

  /**
   * Call factory function previously registered for `modelName`
   * @see {@link registerModel} for further info 
   * @param {String} modelName 
   * @param {*} args
   * @returns {*} the model instance
   */
  async createModel(modelName, args) {
    modelName = checkModelName(modelName);
    if (modelFactories.has(modelName)) {
      return modelFactories.get(modelName)(args);
    }
    throw new Error('unregistered model');
  }

  /**
   * Call factory function previously registered for `eventName`
   * @see {@link registerEvent}
   * @param {String} eventName 
   * @param {String} modelName 
   * @param {*} args 
   * @returns {*} the event instance
   */
  async createEvent(eventName, modelName, args) {
    modelName = checkModelName(modelName);
    eventName = checkEventName(eventName);
    if (eventFactories[eventName].has(modelName)) {
      return eventFactories[eventName].get(modelName)(args);
    }
    throw new Error('unregistered model event');
  }
}