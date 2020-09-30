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
 * @namespace
 */
const Model = (() => {

  const ID = Symbol('id');
  const MODELNAME = Symbol('modelName');
  const CREATETIME = Symbol('createTime');
  const ONUPDATE = Symbol('onUpdate');
  const ONDELETE = Symbol('onDelete');

  const keyMap = {
    id: ID,
    modelName: MODELNAME,
    createTime: CREATETIME,
    onUpdate: ONUPDATE,
    onDelete: ONDELETE
  }

  const defUpdate = (model, changes) => ({
    ...model,
    ...changes
  })

  const defDelete = (model) => ({
    ...withTimestamp('deleteTime')(model)
  })

  /**
   * @lends Model
   * @namespace
   * @class
   */
  const Model = async ({
    factory,
    args,
    modelName,
    mixins = [],
    onUpdate = defUpdate,
    onDelete = defDelete
  }) => Promise.resolve(
    factory(args)
  ).then(model => ({
    ...compose(...mixins)(model),
    [MODELNAME]: modelName,
    [ONUPDATE]: onUpdate,
    [ONDELETE]: onDelete
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
     *  factory: function(*):any, 
     *  args: any, 
     *  modelName: String, 
     *  onUpdate?: function(Model,*):Model,
     *  onDelete?: function(Model):Model, 
     *  mixins?: Array<import('./mixins').mixinFunction>
     * }} options 
     * 
     * @returns {Promise<Readonly<Model>>}
     */
    create: async (options) => Object.freeze(makeModel(options)),

    /**
     * 
     * @param {Model} model
     * @param {Object} changes
     * @returns {Model} updated model
     * 
     */
    update: (model, changes) => {
      return model[ONUPDATE](model, changes);
    },

    /**
     * @param {Model} model
     * @returns {Model}
     */
    delete: (model) => {
      return model[ONDELETE](model);
    },

    /**
     * Get private symbol for `key`
     * @param {string} key 
     * @returns {Symbol}
     */
    getKey: (key) => {
      return keyMap[key];
    },

    /**
     * Get model ID
     * @param {Model} model 
     * @returns {string} model ID
     */
    getId: (model) => {
      return model[ID];
    },

    /**+
     * Get model name
     * @param {Model} model
     * @returns {string} model name
     */
    getName: (model) => {
      return model[MODELNAME];
    }
  }
})();

export default Model;

