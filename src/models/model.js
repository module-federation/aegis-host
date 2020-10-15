import {
  withId,
  withTimestamp,
  withSymbolsInJSON
} from './mixins';
import asyncPipe from '../lib/async-pipe';
import compose from '../lib/compose';
import uuid from '../lib/uuid';

/**
 * @namespace
 */
const Model = (() => {

  // Render props immutable w/ local symbols
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
   * Calls factory with user input and 
   * mixin pipeline to create model.
   * @lends Model
   * @namespace
   * @class
   */
  const Model = async ({
    spec: {
      factory,
      modelName,
      mixins = [],
      onUpdate = defUpdate,
      onDelete = defDelete
    },
    args
  }) => Promise.resolve(
    factory(...args) // factory with user input
  ).then(model => ({
    ...compose(...mixins)(model), // optn'l mixins
    [ONUPDATE](changes) {
      return onUpdate(this, changes);
    },
    [ONDELETE]() {
      return onDelete(this);
    },
    [MODELNAME]: modelName
  }));

  // Add common behavior & data
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
     *  spec: {
     *    factory: function(*):any, 
     *    modelName: String, 
     *    onUpdate?: function(Model,*):Model,
     *    onDelete?: function(Model):Model, 
     *    mixins?: Array<import('./mixins').mixinFunction>
     *  }, 
     *  args: any[]
     * }} modelInfo 
     * 
     * @returns {Promise<Readonly<Model>>}
     */
    create: async (modelInfo) => makeModel(modelInfo),

    /**
     * Process model update request. 
     * (Invokes provided `onUpdate` callback.)
     * @param {Model} model - model instance to update
     * @param {Object} changes - Object containing changes
     * @returns {Model} updated model
     * 
     */
    update: (model, changes) => model[ONUPDATE](changes),

    /**
     * Process model delete request. 
     * (Invokes provided `onDelete` callback.)
     * @param {Model} model
     * @returns {Model}
     */
    delete: (model) => model[ONDELETE](),

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

