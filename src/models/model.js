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

  // Render immutable w/ local symbols
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
   * Generates functions to handle I/O between
   * the domain and application layers
   * @param {*} ports - the domain interfaces 
   * @param {*} adapters - the application adapters 
   */
  function makePorts(ports, adapters) {
    if (!ports || !adapters) {
      return;
    }
    return Object.keys(ports).map(function (port) {
      if (port.disabled || !adapters[port]) {
        console.warn(
          'warning: port disabled or adapter missing: %s',
          port
        );
        return;
      }
      return {
        async [port](...args) {
          return adapters[port]({
            model: this,
            parms: args
          });
        }
      }
    }).reduce((p, c) => ({ ...c, ...p }));
  }

  /**
   * Call factory with user input, generate port functions 
   * and run functional mixin pipeline to create model
   * @lends Model
   * @namespace
   * @class
   */
  const Model = async ({
    args,
    spec: {
      ports,
      factory,
      modelName,
      mixins = [],
      dependencies,
      onUpdate = defUpdate,
      onDelete = defDelete,
    }
  }) => Promise.resolve(
    // Call factory
    factory(...args)
  ).then(model => ({
    // Create ports for domain I/O 
    ...makePorts.call(model, ports, dependencies),
    // Optional mixins
    ...compose(...mixins)(model),
    // Immutable props...
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
     *    ports?: {
     *      [x: string]: {
     *        service: string,
     *        type?:'inbound'|'outbound',
     *        disabled?: boolean
     *      }
     *    }
     *  }, 
     *  args: any[]
     * }} modelInfo 
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

