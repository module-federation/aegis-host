import {
  withId,
  withTimestamp,
  withSymbolsInJSON
} from './mixins';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import asyncPipe from '../lib/async-pipe';
import compose from '../lib/compose';
import uuid from '../lib/uuid';

/*
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

  const defUpdateFn = (model, changes) => ({
    ...model,
    ...changes
  })

  /**
   * @param {{
   *  factory: Function, 
   *  args: any, 
   *  modelName: String, 
   *  onUpdate?: Function, 
   *  mixins?: Array<import('./mixins').mixinFunction>
   * }} options
   * @returns {Promise<Model>}  
   */
  const Model = async ({
    factory,
    args,
    modelName,
    mixins = [],
    onUpdate = defUpdateFn
  }) => Promise.resolve(
    factory(args)
  ).then(model => ({
    ...compose(...mixins)(model),
    [MODELNAME]: modelName,
    [ONUPDATE]: onUpdate
  }))

  const makeModel = asyncPipe(
    Model,
    withTimestamp(CREATETIME),
    withId(ID, uuid),
    withSymbolsInJSON(keyMap)
  );

  return {
    /**
     * @param {{
     *  factory: Function, 
     *  args: any, 
     *  modelName: String, 
     *  onUpdate?: Function, 
     *  mixins?: Array<import('./mixins').mixinFunction>
     * }} options 
     * @returns {Promise<Model>}
     */
    create: async (options) => makeModel(options),

    /**
     * 
     * @param {{model: Model, changes: any[]}} model 
     */
    update: (model, changes) => {
      return model[ONUPDATE](model, changes);
    },

    getKey: function (key) {
      return keyMap[key];
    },

    getId: function (model) {
      return model[keyMap['id']];
    }
  }
})();

export default Model;

