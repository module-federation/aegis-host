import { withId, withTimestamp } from './mixins';
import regeneratorRuntime from 'regenerator-runtime';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';
import log from '../lib/logger';

/**
 * @typedef {Object} Model
 * @property {String} id - unique id
 * @property {String} modelName - model name
 * @property {String} createTime - time created
 * @property {Function} [isValid] - check model is valid
 */

const Model = (() => {

  const _isValid = () => {
    return this.id && this.modelName;
  }

  /**
   * 
   * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({ factory, args, modelName, isValid = _isValid }) => {
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
    withTimestamp('createTime'),
    withId(uuid),
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options 
     * @returns {Promise<Model>}
     */
    create: (options) => {
      return makeModel(options);
    },

    /**
     * 
     * @param {Model} model 
     */
    validate: (model) => {
      try {
        return model.isValid();
      } catch (error) {
        log(error);
      }
      return false;
    }
  }
})();

export default Model;

