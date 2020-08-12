import crypto from 'crypto';
import ModelFactoryInstance, { Events } from './model-factory';
import createModel1Factory from './model1';
import createModel1EventFactory from './model1-create-event';
import updateModel1EventFactory from './model1-update-event';
import { MODEL_NAME as MODEL1 } from './model1';

/**
 * Model factory singleton
 */
const ModelFactory = (function () {
  let instance;
  const eventNames = Events;

  function createInstance() {
    return new ModelFactoryInstance();
  }

  return {
    /**
     * Get `ModelFactory` singleton
     * @returns {ModelFactoryInstance} singleton
     */
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
    /**
     * Event name values to use in call to `createEvent()`
     */
    eventNames
  };
})();

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.randomBytes(16)[0] & 15 >> c / 4).toString(16));
}

function hash(data) {
  return crypto.createHash('md5').update(data);
}

const factory = ModelFactory.getInstance();
factory.registerModel(MODEL1, createModel1Factory(uuidv4, hash));
factory.registerEvent(Events.CREATE, MODEL1, createModel1EventFactory(uuidv4));
factory.registerEvent(Events.UPDATE, MODEL1, updateModel1EventFactory(uuidv4));

export default ModelFactory;