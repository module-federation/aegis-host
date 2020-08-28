import Model from './model';
import Event from './event';

/**
 * @typedef {import('./model').Model} Model
 * @typedef {import('./event').Event} Event
 */

/**
 * @callback factoryFunc
 * @param {*} args
 */

/**
 * @callback registerModel
 * @param {String} modelName
 * @param {factoryFunc} factory
 * @param {Function | null} isValid
 */

/**
 * @callback registerEvent
 * @param {String} eventType
 * @param {String} modelName
 * @param {factoryFunc} factory
 */

/**
 * @callback createModel
 * @param {String} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Model>>}
 */

/**
 * @callback createEvent
 * @param {String} eventType
 * @param {String} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Event>>}
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
       * @param {Function} fnFactory
       * @param {Function?} fnIsValid
       */
      registerModel: (modelName, fnFactory, fnIsValid = () => true) => {
        modelName = checkModelName(modelName);

        if (!modelFactories.has(modelName)
          && typeof fnFactory === 'function'
          && typeof fnIsValid === 'function') {
          modelFactories.set(modelName, { fnFactory, fnIsValid });
        }
      },

      /**
       * Register a factory function to create an event for the model `modelName`
       * @param {String} eventType type of event {@link EventTypes}
       * @param {String} modelName model the event is about
       * @param {Function} fnFactory - factory function
       */
      registerEvent: (eventType, modelName, fnFactory) => {
        modelName = checkModelName(modelName);
        eventType = checkEventType(eventType);

        if (typeof fnFactory === 'function') {
          eventFactories[eventType].set(modelName, fnFactory);
        }
      },

      /**
       * Call the factory function previously registered for `modelName`
       * @param {String} modelName 
       * @param {*} args
       * @returns {Promise<Readonly<Model>>} the model instance
       */
      createModel: async (modelName, args) => {
        modelName = checkModelName(modelName);

        if (modelFactories.has(modelName)) {
          const model = await Model.create({
            isValid: modelFactories.get(modelName).fnIsValid,
            factory: modelFactories.get(modelName).fnFactory,
            modelName: modelName,
            args: args
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
       * @returns {Promise<Readonly<Event>>} the event instance
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


