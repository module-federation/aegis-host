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
   * @param {{
   *  factory: Function, 
   *  args: any, 
   *  modelName: String, 
   *  isValid?: Function, 
   *  mixins: Array<import('./mixins').mixinFunction>
   * }} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({
    factory,
    args,
    modelName,
    isValid = () => this.id && this.modelName,
    allowUpdates = true,
    mixins
  }) => Promise.resolve(
    factory(args)
  ).then(model => ({
    ...compose(...mixins)(model),
    isValid,
    modelName
  }))

  const makeModel = asyncPipe(
    Model,
    withTimestamp('createTime'),
    withId(uuid),
    // withImmutableProps(
    //   'modelName', 
    //   'createTime', 
    //   'id'
    // )
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options 
     * @returns {Promise<Model>}
     */
    create: makeModel,

    /**
     * 
     * @param {{model: Model, changes: any[]}} model 
     */
    validate: ({ model, changes }) => {
      try {
        if (model.permitUpdate(changes)) {
          return model.isValid(changes);
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

