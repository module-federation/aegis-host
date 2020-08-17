import crypto from 'crypto';
import uuid from '../lib/uuid';
import ModelFactoryInstance, {
  EventTypes,
  createEventName
} from './model-factory';
import createModel1Factory from './model1';
import createModel1EventFactory from './model1-create-event';
import updateModel1EventFactory from './model1-update-event';
import { MODEL_NAME as MODEL1 } from './model1';

/**
 * Model factory singleton
 */
const ModelFactory = (function () {
  let instance;
  const eventTypes = EventTypes;

  function createInstance() {
    return new ModelFactoryInstance();
  }

  return {
    /**
     * Get factory singleton
     * @returns {ModelFactoryInstance} singleton
     */
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
    /**
     * event name
     * @param {String} eventType 
     * @param {String} modelName 
     */
    getEventName: function (eventType, modelName) {
      return createEventName(eventType, modelName);
    },
    /**
     * Event type values to use in call to `createEvent()`
     */
    eventTypes
  };
})();



function hash(data) {
  return crypto.createHash('md5').update(data);
}

function time() {
  return new Date().toUTCString();
}

const factory = ModelFactory.getInstance();

factory.registerModel(
  MODEL1,
  createModel1Factory(hash, time)
);

factory.registerEvent(
  EventTypes.CREATE,
  MODEL1,
  createModel1EventFactory(uuid, time)
);

factory.registerEvent(
  EventTypes.UPDATE,
  MODEL1,
  updateModel1EventFactory(uuid, time)
);

export default ModelFactory;