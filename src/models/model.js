import {
  withId,
  withTimestamp,
  withSymbolsInJSON
} from './mixins';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import asyncPipe from '../lib/async-pipe';
import compose from '../lib/compose';
import uuid from '../lib/uuid';

/**
 * @typedef {Object} Model
 * @property {String} id - unique id
 * @property {String } modelName - model name
 * @property {String} createTime - time created
 * @property {Function} [onUpdate] - check model is valid
 */

const Model = (() => {

  const ID = Symbol('id');
  const MODELNAME = Symbol('modelName');
  const CREATETIME = Symbol('createTime');
  const ONUPDATE = Symbol('onUpdate');

  const keyMap = {
    id: ID,
    modelName: MODELNAME,
    createTime: CREATETIME,
    onUpdate: ONUPDATE,
  }

  /**
   * @param {{
   *  factory: Function, 
   *  args: any, 
   *  modelName: String, 
   *  onUpdate: Function, 
   *  mixins: Array<import('./mixins').mixinFunction>
   * }} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({
    factory,
    args,
    modelName,
    mixins = [],
    onUpdate
  }) => Promise.resolve(
    factory(args)
  ).then(model => ({
    ...compose(...mixins)(model),
    [MODELNAME]: modelName,
    [ONUPDATE]: onUpdate
  }));

  const makeModel = asyncPipe(
    Model,
    withTimestamp(CREATETIME),
    withId(ID, uuid),
    withSymbolsInJSON(keyMap)
  );

  function getKey(key) {
    return keyMap[key];
  }

  return {
    /**
     * @param {{
     *  factory: Function, 
     *  args: any, 
     *  modelName: String, 
     *  onUpdate: Function, 
     *  mixins: Array<import('./mixins').mixinFunction>
     * }} options 
     * @returns {Promise<Model>}
     */
    create: makeModel,

    /**
     * 
     * @param {{model: Model, changes: any[]}} model 
     */
    validate: ({ model, changes }) => {
      model[ONUPDATE]({model, changes});
    },

    getKey

  }
})();

export default Model;

