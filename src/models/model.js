"use strict";

import {
  withTimestamp,
  withSerializers,
  withDeserializers,
  fromSymbol,
  fromTimestamp,
  toSymbol
} from "./mixins";
import makePorts from "./make-ports";
import compensate from "./compensate";
import asyncPipe from "../lib/async-pipe";
import compose from "../lib/compose";
import uuid from "../lib/uuid";
import pipe from "../lib/pipe";

/**
 * @namespace
 */
const Model = (() => {
  // Render immutable w/ local symbols
  const ID = Symbol("id");
  const MODELNAME = Symbol("modelName");
  const CREATETIME = Symbol("createTime");
  const UPDATETIME = Symbol("updateTime");
  const ONUPDATE = Symbol("onUpdate");
  const ONDELETE = Symbol("onDelete");
  const PORTFLOW = Symbol("portFlow");

  const keyMap = {
    id: ID,
    modelName: MODELNAME,
    createTime: CREATETIME,
    updateTime: UPDATETIME,
    onUpdate: ONUPDATE,
    onDelete: ONDELETE,
    portFlow: PORTFLOW,
  };

  const defUpdate = (model, changes) => ({
    ...model,
    ...changes,
  });

  const defDelete = (model) => ({
    ...withTimestamp("deleteTime")(model),
  });

  /**
   * 
   * @param {{
   *  model:import('./index').Model,
   *  spec:import('./index').ModelSpecification
   * }} param0 
   */
  function make({
    model,
    spec: {
      ports,
      observer,
      modelName,
      datasource,
      mixins = [],
      dependencies,
      onUpdate = defUpdate,
      onDelete = defDelete,
    },
  }) {
    return {
      ...model,
      // Optional mixins
      ...compose(...mixins)(model),
      // Create ports for domain I/O
      ...makePorts.call(model, ports, dependencies, observer),
      // Remember port calls
      [PORTFLOW]: [],
      // Undo port transaction
      compensate: compensate.call(model, ports),
      // name
      [MODELNAME]: modelName,
      // uuid
      [ID]: uuid(),
      // Call before saving
      [ONUPDATE](changes) {
        return onUpdate(this, changes);
      },
      // Call before deleting
      [ONDELETE]() {
        return onDelete(this);
      },
      /**
       * User code calls this to persist any updates it makes.
       * @param {*} changes
       */
      async update(changes) {
        const model = this[ONUPDATE](changes);
        const update = await datasource.save(model[ID], model);
        return update;
      },
      /**
       * Listen for domain events.
       * @param {*} eventName
       * @param {*} callback
       */
      addListener(eventName, callback) {
        observer.on(eventName, callback);
      },
      /**
       * Emit domain events.
       * @param {*} eventName
       * @param {*} eventData
       */
      async emit(eventName, eventData) {
        await observer.notify(eventName, eventData);
      },
    };
  }

  /**
   * Call factory with user input, generate port functions
   * and compose functional mixins to create model.
   * @lends Model
   * @namespace
   * @class
   * @param {{
   *  args: any[],
   *  spec: import('./index').ModelSpecification
   * }} modelInfo
   */
  const Model = async (modelInfo) =>
    Promise.resolve(
      // Call factory
      modelInfo.spec.factory(...modelInfo.args)
    ).then((model) =>
      make({
        model,
        spec: modelInfo.spec,
      })
    );

  // Add common behavior & data
  const makeModel = asyncPipe(
    Model,
    withTimestamp(CREATETIME),
    withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime", "updateTime"])
    ),
    withDeserializers(toSymbol(keyMap)),
    Object.freeze
  );

  const loadModel = pipe(
    make,
    withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime", "updateTime"])
    ),
    withDeserializers(toSymbol(keyMap)),
    Object.freeze
  );

  return {
    /**
     * Create a new model instance
     * @param {{
     *  spec: import('./index').ModelSpecification
     *  args: any[]
     * }} modelInfo
     * @returns {Promise<Readonly<Model>>}
     */
    create: async (modelInfo) => makeModel(modelInfo),

    /**
     * Invoked when loading saved models
     * @param {Model} savedModel deserialized model
     * @param {import('../models').ModelSpecification} spec
     */
    load: function (modelInfo) {
      return loadModel({
        model: {
          ...modelInfo.model,
          isLoading: true,
        },
        spec: {
          ...modelInfo.spec,
        },
      });
    },

    /**
     * Process model update request.
     * (Invokes user-provided `onUpdate` callback.)
     * @param {Model} model - model instance to update
     * @param {Object} changes - Object containing changes
     * @returns {Model} updated model
     *
     */
    update: function (model, changes) {
      const updates = {
        ...changes,
        [UPDATETIME]: new Date().getTime(),
        isLoading: false,
      };
      return model[ONUPDATE](updates);
    },

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

    /**
     * History of port invocation
     */
    getPortFlow: (model) => model[PORTFLOW],
  };
})();

export default Model;