import Model from './model';
import Event from './event';

/**
 * @typedef {import('./model').Model} Model
 * @typedef {import('./event').Event} Event
 */

/**
 * @callback factoryFunc
 */

/**
 * @callback registerModel
 * @param {String} modelName
 * @param {factoryFunc} factory
 */

/**
 * @callback registerModel
 * @param {String} modelName
 * @param {factoryFunc} factory
 */

/**
 * @callback createModel
 * @param {String} modelName
 * @param {*} args
 * @returns {Readonly<Promise<Model>>}
 */

/**
 * @callback createEvent
 * @param {String} eventType
 * @param {String} modelName
 * @param {*} args
 * @returns {Readonly<Promise<Event>>}
 */

/**
 * @typedef {Object} ModelFactory
 * @property {registerModel} registerModel
 * @property {registerEvent} registerEvent
 * @property {createModel} createModel
 * @property {createEvent} createEvent
 */

const ModelFactory = (() => {
  let instance;

  const EventTypes = {
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

  function createEventName(eventType, modelName) {
    return checkEventType(eventType) + checkModelName(modelName);
  }

  function init() {
    const modelFactories = new Map();
    const eventFactories = {
      [EventTypes.CREATE]: new Map(),
      [EventTypes.UPDATE]: new Map(),
      [EventTypes.DELETE]: new Map()
    }

    return {
      /**
       * Register a factory function to create the model `modelName`
       * @param {String} modelName 
       * @param {Function} factoryFunction 
       */
      registerModel: (modelName, factoryFunction) => {
        modelName = checkModelName(modelName);

        if (!modelFactories.has(modelName)
          && typeof factoryFunction === 'function') {
          modelFactories.set(modelName, factoryFunction);
        }
      },

      /**
       * Register a factory function to create an event for the model `modelName`
       * @param {String} eventType Name of event {@link EventTypes}
       * @param {String} modelName
       * @param {Function} factoryFunction
       */
      registerEvent: (eventType, modelName, factoryFunction) => {
        modelName = checkModelName(modelName);
        eventType = checkEventType(eventType);

        if (typeof factoryFunction === 'function') {
          eventFactories[eventType].set(modelName, factoryFunction);
        }
      },

      /**
       * Call the factory function previously registered for `modelName`
       * @param {String} modelName 
       * @param {*} args
       * @returns {Readonly<Promise<Model>>} the model instance
       */
      createModel: async (modelName, args) => {
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
      },

      /**
       * Call factory function previously registered for `eventType` and `model`
       * @param {String} eventType 
       * @param {String} modelName 
       * @param {*} args 
       * @returns {Readonly<Promise<Event>>} the event instance
       */
      createEvent: async (eventType, modelName, args) => {
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
      },
    }
  }

  return {
    /**
     * Get singleton
     * @returns {ModelFactory}
     */
    getInstance: () => {
      if (!instance) {
        instance = init();
      }
      return instance;
    },

    getEventName: (eventType, modelName) => {
      return createEventName(eventType, modelName);
    },

    EventTypes
  }
})();

export default ModelFactory;


