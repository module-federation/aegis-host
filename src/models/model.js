import { withId, withTimestamp, utc } from './mixins';
import regeneratorRuntime from 'regenerator-runtime';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';
import log from '../lib/logger';

/**
 * @typedef {Object} Model
 * @property {String} id - unique id
 * @property {String} modelName - model name
 * @property {String} createTime - time created
 * @property {Function} isValid - check model is valid
 */

const Model = (() => {

  /**
   * 
   * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({ factory, args, modelName, isValid = () => true }) => {
    return Promise.resolve(
      factory(args)
    ).then(model => ({
      modelName,
      isValid,
      ...model
    }));
  }

  const makeModel = asyncPipe(
    Model,
    withTimestamp(utc),
    withId(uuid),
  );

  /**
   * 
   * @param {Model} model 
   */
  const validate = model => {
    try {
      return model.isValid();
    } catch (e) {
      log(e);
    }
    return false;
  }

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options 
     * @returns {Promise<Model>}
     */
    create: function (options) {
      return makeModel(options);
    },

    validate
  }
})();

export default Model;

