import { withId, withTimestamp, utc } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';
import log from '../lib/logger';

/**
 * @typedef {Object} Model
 * @property {Function} getModelName
 * @property {String} id
 * @property {String} created
 * @property {Function} isValid
 */

const Model = (() => {

  const Model = ({ factory, args, modelName, validate = () => true }) => {
    return Promise.resolve(
      factory(args)
    ).then(model => ({
      modelName: modelName,
      isValid: async () => validate(),
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
  const _validate = async model => {
    try {
      return await model.isValid();
    } catch (e) {
      log(e);
    }
    return false;
  }

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String}} options 
     * @returns {Promise<Model>}
     */
    create: async function (options) {
      return makeModel(options);
    },

    validate: _validate
  }
})();

export default Model;

