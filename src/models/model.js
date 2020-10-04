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

  // Use symbols to prevent overwrite
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
   * Create model from factory, mixins and request input
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
    // Call registered fn with input from request 
    factory(args)
  ).then(model => ({
    // Execute any mixins provided
    ...compose(...mixins)(model),
    // Use symbols as keys to prevent overwrite
    [MODELNAME]: modelName,
    [ONUPDATE]: onUpdate,
    [ONDELETE]: onDelete
  }))

  // Partial app to create model, add metadata, etc
  const makeModel = asyncPipe(
    Model,
    withTimestamp(CREATETIME),
    withId(ID, uuid),
    withSymbolsInJSON(keyMap),
    Object.freeze
  );

  return {
    /**
     * Create a new model instance
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
    create: async (options) => makeModel(options),

    /**
     * Process model update request. 
     * (Invokes provided `onUpdate` callback.)
     * @param {Model} model - model instance to update
     * @param {Object} changes - Object containing changes
     * @returns {Model} updated model
     * 
     */
    update: (model, changes) => {
      return model[ONUPDATE](model, changes);
    },

    /**
     * Process model delete request. 
     * (Invokes provided `onDelete` callback.)
     * @param {Model} model
     * @returns {Model}
     */
    delete: (model) => model[ONDELETE](model),

    /**
     * Get private symbol for `key`
     * @param {string} key 
     * @returns {Symbol} unique symbol
     */
    getKey: (key) => keyMap[key],

    /**
     * Get model ID
     * @param {Model} model 
     * @returns {string} model's ID
     */
    getId: (model) => model[ID],

    /**
     * Get model name
     * @param {Model} model
     * @returns {string} model's name
     */
    getName: (model) => model[MODELNAME],
  }
})();

export default Model;

