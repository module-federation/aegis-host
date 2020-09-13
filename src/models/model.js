import { withId, withTimestamp } from './mixins';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import asyncPipe from '../lib/async-pipe';
import compose from '../lib/compose';
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

  /**
   * 
   * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({
    factory,
    args,
    modelName,
    isValid = () => this.id && this.modelName,
  }) => {
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
    create: async (options) => {
      const model = await makeModel(options);
      return compose(...options.mixins)(model);
    },

    /**
     * 
     * @param {Model} model 
     */
    validate: (model) => {
      try {
        if (model['id'] && model['modelName']) {
          return model.isValid();
        }
        return false;
      } catch (error) {
        log(error);
      }
      return false;
    }
  }
})();

export default Model;

