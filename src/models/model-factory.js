import Model from './model';
import Event from './event';

/**
 * @typedef {import('./model').Model} Model
 * @typedef {import('./event').Event} Event
 */

/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE'} EventType 
 */

/**
 * @callback fnModelFactory
 * @param {*} args
 * @returns {Promise<Readonly<Model>>}
 */

/**
 * @callback fnEventFactory
 * @param {*} args
 * @returns {Promise<Readonly<Event>>}
 */

/**
 * @callback fnIsValid
 * @returns {Promise<boolean>}
 */

/**
 * @callback fnHandler
 * @param {Event} event
 * @returns {Promise<void>}
 */

/**
 * @callback registerModel
 * @param {{modelName: string,
 *  fnFactory:fnModelFactory,
 *  fnIsValid:fnIsValid,
 *  fnHandler:fnHandler,
 *  isRemote:boolean
 * }} options
 */

/**
 * @callback registerEvent
 * @param {EventType} eventType
 * @param {String} modelName
 * @param {fnEventFactory} factory
 */

/**
 * @callback createModel
 * @param {string} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Model>>}
 */

/**
 * @callback createEvent
 * @param {EventType} eventType
 * @param {string} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Event>>}
 */

/**
 * @typedef {Object} ModelFactory
 * @property {registerModel} registerModel
 * @property {registerEvent} registerEvent
 * @property {createModel} createModel
 * @property {createEvent} createEvent
 * @property {{CREATE:string, UPDATE:string, DELETE:string}} EventTypes
 */

const ModelFactory = (() => {
  let instance;

  /**
   * @readonly
   * @enum {EventType}
   */
  const EventTypes = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }

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

  /**
   * @returns {ModelFactory} instance
   * 
   */
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
       */
      registerModel: ({
        modelName,
        fnFactory,
        fnIsValid = () => true,
        fnHandler,
        isRemote = false,
        mixins = []
      }) => {
        modelName = checkModelName(modelName);

        if (!modelFactories.has(modelName)
          && typeof fnFactory === 'function'
          && typeof fnIsValid === 'function') {
          modelFactories.set(modelName, {
            fnFactory, fnIsValid, fnHandler, isRemote, mixins
          });
        }
      },

      /**
       * Register a factory function to create an event for the model `modelName`
       * @param {EventType} eventType type of event
       * @param {String} modelName model the event is about
       * @param {Function} fnFactory factory function
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
            modelName: modelName,
            isValid: modelFactories.get(modelName).fnIsValid,
            factory: modelFactories.get(modelName).fnFactory,
            mixins: modelFactories.get(modelName).mixins,
            args: args,
          });
          return Object.freeze(model);
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

      EventTypes
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

    /**
     * @param {EventType} eventType
     * @param {String} modelName
     */
    getEventName: (eventType, modelName) => {
      return createEventName(eventType, modelName);
    },

    EventTypes
  }
})();



export default ModelFactory;


